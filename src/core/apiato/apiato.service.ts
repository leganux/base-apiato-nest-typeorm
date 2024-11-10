import { Injectable } from '@nestjs/common';
import { Repository, FindOptionsWhere, Like, FindManyOptions, ObjectLiteral } from 'typeorm';

export interface IPaginationMeta {
  pagination: {
    total: number;
    page: number;
    per_page: number;
  };
}

export interface IResponse {
  status: number;
  message: string;
  data: object | object[] | null | undefined;
  success: boolean;
  meta: IPaginationMeta | null | undefined;
}

export interface BaseEntity {
  id: string;
}

export const Responses = {
  success: function (
    data: any,
    message: string = 'ok',
    total: number = 1,
    page: number = 1,
    per_page: number = 1,
  ): IResponse {
    return {
      status: 200,
      message: message,
      data,
      success: true,
      meta: {
        pagination: {
          total: total,
          page: page,
          per_page: per_page,
        },
      },
    };
  },
  notFound: function (message: string = 'Element not found'): IResponse {
    return {
      data: undefined,
      meta: undefined,
      status: 404,
      message: message,
      success: false,
    };
  },
  badRequest: function (message: string = 'Bad Request'): IResponse {
    return {
      data: undefined,
      meta: undefined,
      status: 400,
      message: message,
      success: false,
    };
  },
  internalServerError: function (
    message: string = 'Internal server error',
  ): IResponse {
    return {
      data: undefined,
      meta: undefined,
      status: 400,
      message: message,
      success: false,
    };
  },
};

@Injectable()
export abstract class ApiatoService<T extends BaseEntity & ObjectLiteral, CreateDto, UpdateDto> {
  constructor(
    protected readonly repository: Repository<T>,
    protected options: any = {},
  ) {}

  async createOne(create: CreateDto, query: any): Promise<IResponse> {
    try {
      if (this?.options?.createOnefIn_) {
        create = await this?.options.createOnefIn_(create);
      }

      let newElement = await this.repository.save(create as any);
      
      if (this?.options?.createOnefOut_) {
        newElement = await this?.options?.createOnefOut_(newElement);
      }

      return Responses.success(newElement, 'Ok');
    } catch (error) {
      console.error(error);
      return Responses.internalServerError(error.message);
    }
  }

  async createMany(create: CreateDto[], query: any): Promise<IResponse> {
    try {
      if (this?.options?.createManyfIn_) {
        create = this?.options?.createManyfIn_(create);
      }

      let newElements = await this.repository.save(create as any[]);

      if (this?.options?.createManyfOut_) {
        newElements = await this?.options?.createManyfOut_(newElements);
      }

      return Responses.success(newElements, 'Ok');
    } catch (error) {
      console.error(error);
      return Responses.internalServerError(error.message);
    }
  }

  async getMany(query: any): Promise<IResponse> {
    try {
      if (this?.options?.getManyfIn_) {
        query = await this?.options?.getManyfIn_(query);
      }

      const { where, like, paginate, sort } = query;

      const whereClause: FindOptionsWhere<T> = {};

      if (like) {
        for (const [key, val] of Object.entries<string>(like)) {
          whereClause[key as keyof T] = Like(`%${val}%`) as any;
        }
      }

      if (where) {
        Object.assign(whereClause, where);
      }

      const options: FindManyOptions<T> = {
        where: whereClause,
      };

      if (paginate?.limit && paginate?.page) {
        options.skip = paginate.page * paginate.limit;
        options.take = paginate.limit;
      }

      if (sort) {
        options.order = sort;
      }

      const [elements, total] = await this.repository.findAndCount(options);
      let result = elements;

      if (this?.options?.getManyfOut_) {
        result = await this?.options?.getManyfOut_(elements);
      }

      return Responses.success(
        result,
        'ok',
        total,
        paginate?.page,
        paginate?.limit || total,
      );
    } catch (error) {
      console.error(error);
      return Responses.internalServerError(error.message);
    }
  }

  async getOneById(id: string, query: any): Promise<IResponse> {
    try {
      if (this?.options?.getOneByIdfIn_) {
        query = await this?.options?.getOneByIdfIn_(query);
      }

      const where: FindOptionsWhere<T> = {
        id: id as any
      };

      let element = await this.repository.findOne({ where });

      if (!element) {
        return Responses.notFound();
      }

      if (this?.options?.getOneByIdfOut_) {
        element = await this?.options?.getOneByIdfOut_(element);
      }

      return Responses.success(element, 'Ok');
    } catch (error) {
      console.error(error);
      return Responses.internalServerError(error.message);
    }
  }

  async getOneWhere(query: any): Promise<IResponse> {
    try {
      if (this?.options?.getOneWherefIn_) {
        query = await this?.options?.getOneWherefIn_(query);
      }

      const { where, like } = query;
      const whereClause: FindOptionsWhere<T> = {};

      if (like) {
        for (const [key, val] of Object.entries<string>(like)) {
          whereClause[key as keyof T] = Like(`%${val}%`) as any;
        }
      }

      if (where) {
        Object.assign(whereClause, where);
      }

      let element = await this.repository.findOne({ where: whereClause });

      if (!element) {
        return Responses.notFound();
      }

      if (this?.options?.getOneWherefOut_) {
        element = await this?.options?.getOneWherefOut_(element);
      }

      return Responses.success(element, 'Ok');
    } catch (error) {
      console.error(error);
      return Responses.internalServerError(error.message);
    }
  }

  async findUpdateOrCreate(update: UpdateDto, query: any): Promise<IResponse> {
    try {
      if (this?.options?.findUpdateOrCreatefIn_) {
        query = await this?.options?.findUpdateOrCreatefIn_(query);
      }

      const { where } = query;

      let element = await this.repository.findOne({ where });

      if (!element) {
        element = await this.repository.save({ ...where, ...update } as any);
      } else {
        await this.repository.update(where, update as any);
        element = await this.repository.findOne({ where });
      }

      if (this?.options?.findUpdateOrCreatefOut_) {
        element = await this?.options?.findUpdateOrCreatefOut_(element);
      }

      return Responses.success(element, 'Ok');
    } catch (error) {
      console.error(error);
      return Responses.internalServerError(error.message);
    }
  }

  async findUpdate(update: UpdateDto, query: any): Promise<IResponse> {
    try {
      if (this?.options?.findUpdatefIn_) {
        query = await this?.options?.findUpdatefIn_(query);
      }

      const { where } = query;

      let element = await this.repository.findOne({ where });

      if (!element) {
        return Responses.notFound();
      }

      await this.repository.update(where, update as any);
      element = await this.repository.findOne({ where });

      if (this?.options?.findUpdatefOut_) {
        element = await this?.options?.findUpdatefOut_(element);
      }

      return Responses.success(element, 'Ok');
    } catch (error) {
      console.error(error);
      return Responses.internalServerError(error.message);
    }
  }

  async updateById(update: UpdateDto, id: string, query: any): Promise<IResponse> {
    try {
      if (this?.options?.updateByIdfIn_) {
        query = await this?.options?.updateByIdfIn_(query);
      }

      const where: FindOptionsWhere<T> = {
        id: id as any
      };

      let element = await this.repository.findOne({ where });

      if (!element) {
        return Responses.notFound();
      }

      await this.repository.update({ id } as any, update as any);
      element = await this.repository.findOne({ where });

      if (this?.options?.updateByIdfOut_) {
        element = await this?.options?.updateByIdfOut_(element);
      }

      return Responses.success(element, 'Ok');
    } catch (error) {
      console.error(error);
      return Responses.internalServerError(error.message);
    }
  }

  async findIdAndDelete(id: string, query: any): Promise<IResponse> {
    try {
      if (this?.options?.findIdAndDeletefIn_) {
        query = await this?.options?.findIdAndDeletefIn_(query);
      }

      const { isLogic } = query;

      const where: FindOptionsWhere<T> = {
        id: id as any
      };

      if (isLogic) {
        const element = await this.repository.findOne({ where });
        if (!element) {
          return Responses.notFound();
        }
        await this.repository.update({ id } as any, { deletedAt: new Date() } as any);
      } else {
        await this.repository.delete(id);
      }

      return Responses.success({}, 'Ok');
    } catch (error) {
      console.error(error);
      return Responses.internalServerError(error.message);
    }
  }
}
