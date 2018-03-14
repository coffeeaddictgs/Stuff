#pragma once

#include <iostream>
#include <fstream>
#include <bitset>


#define BMP_HEADER_WIDTH_HEIGHT_LIMIT_BYTE_LOCATION 54
#define BMP_HEADER_WIDTH_BYTE_LOCATION 18
#define BMP_HEADER_HEIGHT_BYTE_LOCATION 22
#define BMP_BITS_PER_PIXEL_BYTE_LOCATION 22
#define BMP_ALOCATED_BYTES_FOR_PIXEL_COLOR 4

void BMP_GetPixelInfo(int & width, int & height, __int8 *& pixelData, std::ifstream * BMPFile)
{
	if (!BMPFile) return;

	__int8 headerWH[BMP_HEADER_WIDTH_HEIGHT_LIMIT_BYTE_LOCATION];

	BMPFile->read(headerWH, BMP_HEADER_WIDTH_HEIGHT_LIMIT_BYTE_LOCATION);

	__int8 * __1byteNotConvertedWidth = &headerWH[BMP_HEADER_WIDTH_BYTE_LOCATION];
	__int8 * __1byteNotConvertedHeight = &headerWH[BMP_HEADER_HEIGHT_BYTE_LOCATION];
	__int8 * __1byteNotConvertedBitsPerPixel = &headerWH[BMP_BITS_PER_PIXEL_BYTE_LOCATION];


	width = *(__int32*)(__1byteNotConvertedWidth);
	height = *(__int32*)(__1byteNotConvertedHeight);
	__int32 bpp = *(__int32*)(__1byteNotConvertedBitsPerPixel);

	int Size_header = BMP_HEADER_WIDTH_HEIGHT_LIMIT_BYTE_LOCATION;
	int Size = (width*height * 3);
	pixelData = new __int8[Size];
	BMPFile->read(pixelData, Size);
}

void BMP_OpenFile(std::string filepath, std::ifstream * file)
{
	file->open(filepath.c_str(), std::ios::in | std::ios::binary);
	std::cout << filepath << " - " << ((*file) ? "Arquivo carregado com sucesso!" : "Erro ao carregar arquivo") << std::endl;
}
