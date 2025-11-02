import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Roles } from 'src/auth/decorator/role.decorator';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { Product } from './schema/products.schema';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductDto } from './dto/product.dto';
import { AwsService } from '../aws/aws.service';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly awsService: AwsService, // inject S3 service
  ) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('category') category?: string,
  ): Promise<Product[]> {
    return this.productsService.findAll({
      search,
      minPrice,
      maxPrice,
      category,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @UseInterceptors(FilesInterceptor('images'))
  async create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: CreateProductDto,
  ): Promise<Product> {
    const imageUrls = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const url = await this.awsService.uploadFile(file);
        imageUrls.push(url);
      }
    }
    return this.productsService.create({ ...body, images: imageUrls });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  @UseInterceptors(FilesInterceptor('images'))
  async update(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: UpdateProductDto,
  ): Promise<Product> {
    const imageUrls = body.images || [];
    if (files && files.length > 0) {
      for (const file of files) {
        const url = await this.awsService.uploadFile(file);
        imageUrls.push(url);
      }
    }
    return this.productsService.update(id, { ...body, images: imageUrls });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  delete(@Param('id') id: string): Promise<Product> {
    return this.productsService.remove(id);
  }
}
