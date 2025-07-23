import { IsNumber, IsNotEmpty, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PlaceOrderDto {
  @ApiProperty({ example: 1, description: 'Product ID' })
  @IsNumber()
  @IsNotEmpty()
  product_id: number;

  @ApiProperty({ example: 2, description: 'Quantity to order' })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  quantity: number;
}

export class PayOrderDto {
  @ApiProperty({ example: 1, description: 'Order ID to pay for' })
  @IsNumber()
  @IsNotEmpty()
  order_id: number;
}

export class CancelOrderDto {
  @ApiProperty({ example: 1, description: 'Order ID to cancel' })
  @IsNumber()
  @IsNotEmpty()
  order_id: number;
}
