import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrderService } from '../services/order.service';
import { PlaceOrderDto, PayOrderDto, CancelOrderDto } from '../dto/order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post('place')
  @ApiOperation({ summary: 'Place a new order' })
  @ApiResponse({ status: 201, description: 'Order successfully placed' })
  async placeOrder(@Request() req: any, @Body() placeOrderDto: PlaceOrderDto) {
    const userId = req.user.sub;
    return await this.orderService.placeOrder(userId, placeOrderDto);
  }

  @Post('pay')
  @ApiOperation({ summary: 'Pay for an order' })
  @ApiResponse({ status: 200, description: 'Order successfully paid' })
  async payOrder(@Request() req: any, @Body() payOrderDto: PayOrderDto) {
    const userId = req.user.sub;
    return await this.orderService.payOrder(userId, payOrderDto);
  }

  @Post('cancel')
  @ApiOperation({ summary: 'Cancel an order' })
  @ApiResponse({ status: 200, description: 'Order successfully cancelled' })
  async cancelOrder(@Request() req: any, @Body() cancelOrderDto: CancelOrderDto) {
    const userId = req.user.sub;
    return await this.orderService.cancelOrder(userId, cancelOrderDto);
  }

  @Get('my-orders')
  @ApiOperation({ summary: 'Get current user orders' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  async getMyOrders(@Request() req: any) {
    const userId = req.user.sub;
    return await this.orderService.getUserOrders(userId);
  }
}

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private orderService: OrderService) {}

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  async getProducts() {
    try {
      const products = await this.orderService.getProducts();
      console.log('Products found:', products.length);
      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }
}
