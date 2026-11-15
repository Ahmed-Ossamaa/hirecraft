import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponse, getSchemaPath, ApiExtraModels } from '@nestjs/swagger';
import { StandardResponse } from '../interceptors/api-response.interceptor';
import { PaginatedResult } from '../pagination/paginated-results';

export const ApiPaginatedResponse = <DataDto extends Type<unknown>>(
  dataDto: DataDto,
  paginationDto: Type<unknown> = PaginatedResult,
) =>
  applyDecorators(
    ApiExtraModels(StandardResponse, paginationDto, dataDto),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(StandardResponse) },
          {
            properties: {
              data: {
                allOf: [
                  { $ref: getSchemaPath(paginationDto) },
                  {
                    properties: {
                      data: {
                        type: 'array',
                        items: { $ref: getSchemaPath(dataDto) },
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      },
    }),
  );
