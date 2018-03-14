#include "Teste2.h"
#include "SurfaceDetector.h"


ASurfaceDetector::ASurfaceDetector()
{
	/* Inicia componentes */
	BB_CenterActor	= CreateDefaultSubobject<UBillboardComponent>(TEXT("BillboardCenter"));

	RootComponent = BB_CenterActor;

	/* Inicia componentes */
	ArrowDetector	= CreateDefaultSubobject<UArrowComponent>(TEXT("ArrowDetector"));
	ArrowForward	= CreateDefaultSubobject<UArrowComponent>(TEXT("ArrowForward"));

	/* Atacha as flechas */
	ArrowDetector->SetupAttachment(RootComponent);
	ArrowForward->SetupAttachment(RootComponent);

	/* Arrows predefinicoes */
	ArrowDetector->SetRelativeRotation(FRotator::FRotator(-90.0f, 0.0f, 0.0f));
	ArrowForward->SetRelativeRotation(FRotator::FRotator(0.0f, -90.0f, 0.0f));
	ArrowDetector->SetRelativeLocation(FVector());
	ArrowForward->SetRelativeLocation(FVector());
	ArrowDetector->ArrowSize = 0.5f;
	ArrowForward->ArrowSize = 0.5f;

	bRunConstructionScriptOnDrag = true;

	PrimaryActorTick.bCanEverTick = true;
}


void ASurfaceDetector::BeginPlay()
{
	GetWorld()->DebugDrawTraceTag = TEXT("SurfaceDetectorSystemTrace");
	Super::BeginPlay();
}


void ASurfaceDetector::Tick(float DeltaTime)
{
	Super::Tick(DeltaTime);

}

void ASurfaceDetector::OnConstruction(const FTransform & Position)
{
	/* Predefinitions */
	FlushPersistentDebugLines(GetWorld());

	PointsDone = 0;

	LastSurfaceRelativeNormal = FVector();
	LastFrontTraceDirection = FVector();

	FVector StartLocal, Normal;
	GetStartPoint(StartLocal, Normal);

	SweepLogic(StartLocal, Normal);
	Super::OnConstruction(Position);
}

void ASurfaceDetector::GetStartPoint(FVector & Local, FVector & Normal)
{
	FHitResult R_Hit;
	FVector StartPoint = GetActorLocation();
	FVector EndPoint = StartPoint + FVector(0.0f, 0.0f, -1.0f) * StartPointTraceLength;
	const TArray<AActor*> ActorsToIgnore;
	FCollisionQueryParams QueryParams;
	QueryParams.TraceTag = TEXT("SurfaceDetectorSystemTrace");
	bool HitResult = UKismetSystemLibrary::LineTraceSingle(GetWorld(), StartPoint, EndPoint, UEngineTypes::ConvertToTraceType(ECC_Visibility), false, ActorsToIgnore, (bDebugStartTrace ? EDrawDebugTrace::Persistent : EDrawDebugTrace::None), R_Hit, false);
	
	if (HitResult)
	{
		Local = R_Hit.Location + (R_Hit.Normal*HeightAboveSurface);
		LastSurfaceRelativeNormal = R_Hit.Normal;
		Normal = LastSurfaceRelativeNormal;
	}
	return;
}

void ASurfaceDetector::FrontTrace(FVector InitialPoint, FVector RelativeNormal, FVector & HitLocation, FVector & Normal, FVector & TraceStart, FVector & TraceEnd, bool & Hit)
{
	FHitResult R_Hit;
	FVector CrossRelative = FVector::CrossProduct(GetActorForwardVector(), RelativeNormal);
	LastFrontTraceDirection = CrossRelative;
	FVector Norm_CrossRelativeFVector = CrossRelative.GetSafeNormal();
	FVector StartPoint = InitialPoint;
	FVector EndPoint = InitialPoint + (Norm_CrossRelativeFVector * DistanceBetweenPoints);
	const TArray<AActor*> ActorsToIgnore;
	Hit = UKismetSystemLibrary::LineTraceSingle(GetWorld(), StartPoint, EndPoint, UEngineTypes::ConvertToTraceType(ECC_Visibility), true, ActorsToIgnore, (bDebugFrontTrace ? EDrawDebugTrace::Persistent : EDrawDebugTrace::None), R_Hit, false);
	TraceStart = R_Hit.TraceStart;
	TraceEnd = R_Hit.TraceEnd;

	if (Hit) 
	{
		HitLocation = R_Hit.Location;
		Normal = R_Hit.Normal;
	}
	return;
}

void ASurfaceDetector::SurfaceTrace(FVector StartLocation, FVector RelativeNormal, FVector & HitLocation, FVector & Normal, FVector & TraceStart, FVector & TraceEnd, bool & Hit)
{
	FHitResult R_Hit;
	FVector StartPoint = StartLocation;
	FVector EndPoint = StartLocation - (RelativeNormal*SurfaceDetectorLength);
	const TArray<AActor*> ActorsToIgnore;
	Hit = UKismetSystemLibrary::LineTraceSingle(GetWorld(), StartPoint, EndPoint, UEngineTypes::ConvertToTraceType(ECC_Visibility), false, ActorsToIgnore, (bDebugSurfaceTrace ? EDrawDebugTrace::Persistent : EDrawDebugTrace::None), R_Hit, false);
	TraceStart = R_Hit.TraceStart;
	TraceEnd = R_Hit.TraceEnd;

	if (Hit) {
		HitLocation = R_Hit.Location;
		Normal = R_Hit.Normal;
	}
	return;
}

void ASurfaceDetector::EdgeDetector(FVector StartPoint, FVector EndPoint, FVector & HitLocation, FVector & Normal, FVector & TraceStart, FVector & TraceEnd, FVector & FlowDirection, bool & Hit)
{
	int32 Clamped_EdgePrecision = FMath::Clamp(EdgeDetectorPrecision, 2, 150);
	for (int i = 1; i <= Clamped_EdgePrecision; i++) {
		FHitResult R_Hit;
		FVector DirectionStartToEnd = (EndPoint - StartPoint).GetSafeNormal();
		FVector ScanDirectionVector = DirectionStartToEnd * ((SurfaceDetectorLength / EdgeDetectorPrecision) * i);
		FVector ScanStart = ScanDirectionVector + StartPoint;
		FVector Norm_TraceDistance = (FVector::CrossProduct(LastSurfaceRelativeNormal, GetActorForwardVector()));
		FVector TraceDistance = Norm_TraceDistance * ((DistanceBetweenPoints * EdgeDetectorLengthMultiplier) + 1);
		FVector ScanEnd = TraceDistance + ScanStart;
		const TArray<AActor*> ActorsToIgnore;
		FlowDirection = Norm_TraceDistance;
		Hit = UKismetSystemLibrary::LineTraceSingle(GetWorld(), ScanStart, ScanEnd, UEngineTypes::ConvertToTraceType(ECC_Visibility), false, ActorsToIgnore, (bDebugEdgeDetectorTrace ? EDrawDebugTrace::Persistent : EDrawDebugTrace::None) , R_Hit, false);
		
		TraceStart = R_Hit.TraceStart;
		TraceEnd = R_Hit.TraceEnd;

		if (Hit)
		{
			HitLocation = R_Hit.Location;
			Normal = R_Hit.Normal;
			break;
		}
	}
	return;
}

void ASurfaceDetector::SweepLogic(FVector StartPoint, FVector RelativeNormal)
{
	/* Derifica se já estourou o numero de pontos para interromper a recursividade */
	if (PointsDone > PointsAmount)
	{
		return;
	}

	/* Trace inicial na direção da frente */
	FVector R_Front_HitLocation, R_Front_Normal, R_Front_TraceStart, R_Front_TraceEnd;
	bool R_Front_Hit;
	FrontTrace(StartPoint, RelativeNormal, R_Front_HitLocation, R_Front_Normal, R_Front_TraceStart, R_Front_TraceEnd, R_Front_Hit);

	/* Caso positivo de colisão do trace frontal */
	if (R_Front_Hit)
	{
		LastSurfaceRelativeNormal = R_Front_Normal;
		FVector R_NextStartPoint = R_Front_HitLocation + (R_Front_Normal * HeightAboveSurface);
		FVector R_NextRelativeNormal = LastSurfaceRelativeNormal;
		SweepLogic(R_NextStartPoint, R_NextRelativeNormal);
	}

	/* Caso negativo de colisão do trace frontal */
	else 
	{

		/* Trace de supercifie na direção da normal */
		FVector  R_Surface_HitLocation, R_Surface_Normal, R_Surface_TraceStart, R_Surface_TraceEnd;
		bool R_Surface_Hit;
		SurfaceTrace(R_Front_TraceEnd, LastSurfaceRelativeNormal, R_Surface_HitLocation, R_Surface_Normal, R_Surface_TraceStart, R_Surface_TraceEnd, R_Surface_Hit);

		/* Caso positivo do trace de superficie */
		if (R_Surface_Hit)
		{
			LastSurfaceRelativeNormal = R_Surface_Normal;
			PointsDone++;
			R_Front_TraceEnd = bUseCurvatureEffect ? CalculateCurvatureEffect(R_Front_TraceEnd, LastSurfaceRelativeNormal, R_Front_TraceStart, R_Front_TraceEnd) : R_Front_TraceEnd;
			FVector R_NextStartPoint = R_Front_TraceEnd;
			FVector R_NextRelativeNormal = R_Surface_Normal;
			SweepLogic(R_NextStartPoint, R_NextRelativeNormal);
		}

		/* Caso negativo do trace de superfície */
		else
		{

			/* Trace de reconhecimento de edge */
			FVector R_Edge_HitLocation, R_Edge_Normal, R_Edge_TraceStart, R_Edge_TraceEnd, R_Edge_FlowDirection;
			bool R_Edge_Hit;
			EdgeDetector(R_Surface_TraceStart, R_Surface_TraceEnd, R_Edge_HitLocation, R_Edge_Normal, R_Edge_TraceStart, R_Edge_TraceEnd, R_Edge_FlowDirection, R_Edge_Hit);

			/* Caso positivo do reconhecimento de edge */
			if (R_Edge_Hit)
			{
				LastSurfaceRelativeNormal = R_Edge_Normal;
				FVector R_NextStartPoint = (R_Edge_HitLocation + (R_Edge_Normal * HeightAboveSurface));
				FVector R_NextRelativeNormal = LastSurfaceRelativeNormal;
				SweepLogic(R_NextStartPoint, R_NextRelativeNormal);
			}

			/* Caso negativo do reconhecimento de edge */
			else
			{
				UE_LOG(LogClass, Error, TEXT("Impossível executar varredura de superfície"));
			}
		}

	}
}

FVector ASurfaceDetector::CalculateCurvatureEffect(FVector PositionBeforeCurvature, FVector RelativeNormal, FVector StartFrontPoint, FVector EndFrontPoint)
{
	FVector OffsetDirection = FVector::CrossProduct(((EndFrontPoint - StartFrontPoint).GetSafeNormal()), RelativeNormal).GetSafeNormal();
	return ((OffsetDirection * Curvature * PointsDone) + PositionBeforeCurvature);
}
