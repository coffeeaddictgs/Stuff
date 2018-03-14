// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "GameFramework/Actor.h"
#include "Kismet/KismetSystemLibrary.h"
#include "SurfaceDetector.generated.h"

UCLASS()
class TESTE2_API ASurfaceDetector : public AActor
{
	GENERATED_BODY()
	
protected:

	/* Called when the game starts or when spawned */
	virtual void BeginPlay() override;


private:

	/* Ultima direção em frente registrada */
	UPROPERTY(VisibleDefaultsOnly, Category = "Internal")
	FVector LastFrontTraceDirection;

	/* Ultima direção em frente registrada */
	UPROPERTY(VisibleDefaultsOnly, Category = "Internal")
	FVector LastSurfaceRelativeNormal;

	/* Ultima direção em frente registrada */
	UPROPERTY(VisibleDefaultsOnly, Category = "Internal")
	int32 PointsDone;

public:

	/* Sets default values for this actor's properties */
	ASurfaceDetector();

	/* Called every frame */
	virtual void Tick(float DeltaTime) override;
	
	/* Construtor drag update */
	virtual void OnConstruction(const FTransform & Position) override;

	/* Billboard de demarcação do ator */
	UPROPERTY(VisibleDefaultsOnly, Category = "Components")
	UBillboardComponent * BB_CenterActor;

	/* Flecha visual da direção do detector do chão */
	UPROPERTY(VisibleDefaultsOnly, Category = "Components")
	UArrowComponent * ArrowDetector;

	/* Flecha visual da direção do forward vector para inicialização dos cálculos de acesso a superficie */
	UPROPERTY(VisibleDefaultsOnly, Category = "Components")
	UArrowComponent * ArrowForward;

	/* Tamanho do vetor que pega o solo na primeira vez antes de começar o reconhecimento da superficie */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Surface|Basics")
	float StartPointTraceLength = 70.0f;

	/* Distancia entre um ponto e outro */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Surface|Basics")
	float DistanceBetweenPoints = 30.0f;

	/* Tamanho do vetor de detecção que vai até a superficie usado no SurfaceTrace */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Surface|Basics")
	float SurfaceDetectorLength = 30.0f;

	/* Quantidade que fica pra fora da superficie */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Surface|Basics", meta = (ClampMin = "0.5", ClampMax = "25.0", UIMin = "0.5", UIMax = "25.0"))
	float HeightAboveSurface = 5.0f;

	/* Quantidade total de pontos de varredura */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Surface|Basics")
	int32 PointsAmount = 50;

	/* Caso SurfaceDetectorLenght seja muito grande, a precisão devera ser maior para compensar! Valores altos, diminuiram consideravelmente o desempelho do script do construtor */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Surface|EdgeDetector", meta = (ClampMin = "2", ClampMax = "150", UIMin = "2", UIMax = "150"))
	int32 EdgeDetectorPrecision = 20;

	/* Multiplicador do tamanho do vetor de detecção de edge, melhor não mexer, deixei o valor padrão: 1 */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Surface|EdgeDetector", meta = (ClampMin = "1.0", ClampMax = "10.0", UIMin = "1.0", UIMax = "10.0"))
	float EdgeDetectorLengthMultiplier = 1.0f;

	/* Ainda não implementado */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Surface|EdgeDetector")
	bool UseEdgeSecurePoint;

	/* Seleciona se pode usar curvatura */
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Surface|Curvature")
	bool bUseCurvatureEffect;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Surface|Curvature", meta = (ClampMin = "1.0", ClampMax = "10.0", UIMin = "1.0", UIMax = "10.0", EditCondition = "bUseCurvatureEffect"))
	float Curvature = 1.0f;

	/* Pega ponto inicial para começar a varredura */
	UFUNCTION(BlueprintCallable, Category = "SurfaceDetector")
	void GetStartPoint(FVector & Local, FVector & Normal);

	/* Faz o trace em direção ao cross product da superficie ( ou seja, forward da superficie ) */
	UFUNCTION(BlueprintCallable, Category = "SurfaceDetector", meta=(NativeBreakFunc))
	void FrontTrace(FVector InitialPoint, FVector RelativeNormal, FVector & HitLocation, FVector & Normal, FVector & TraceStart, FVector & TraceEnd, bool & Hit);

	/* Faz o trace em direção a normal invertida encontrada pelo próprio surfacetrace ou fronttrace */
	UFUNCTION(BlueprintCallable, Category = "SurfaceDetector", meta = (NativeBreakFunc))
	void SurfaceTrace(FVector StartLocation, FVector RelativeNormal, FVector & HitLocation, FVector & Normal, FVector & TraceStart, FVector & TraceEnd, bool & Hit);

	/* Faz a detecção de uma aresta quando o front trace falha */
	UFUNCTION(BlueprintCallable, Category = "SurfaceDetector", meta = (NativeBreakFunc))
	void EdgeDetector(FVector StartPoint, FVector EndPoint, FVector & HitLocation, FVector & Normal, FVector & TraceStart, FVector & TraceEnd, FVector & FlowDirection, bool & Hit);

	/* Faz toda a verificação da superficie para decidir a direção de onde continuar a varredura */
	UFUNCTION(BlueprintCallable, Category = "SurfaceDetector", meta = (NativeBreakFunc))
	void SweepLogic(FVector StartPoint, FVector RelativeNormal);

	UFUNCTION(BlueprintCallable, Category = "SurfaceDetector", meta = (NativeBreakFunc))
	FVector CalculateCurvatureEffect(FVector PositionBeforeCurvature, FVector RelativeNormal, FVector StartFrontPoint, FVector EndFrontPoint);
	/* **********************************************
	********************DEBUG VARS*******************
	*************************************************/
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = DEBUG)
	bool bDebugStartTrace;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = DEBUG)
	bool bDebugFrontTrace;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = DEBUG)
	bool bDebugSurfaceTrace;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = DEBUG)
	bool bDebugEdgeDetectorTrace;
};
