import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class OrdersGateway
  implements
    OnGatewayConnection,
    OnGatewayDisconnect
{

  @WebSocketServer()
  server: Server;

  //////////////////////////////////////////////////////
  // Client connected
  //////////////////////////////////////////////////////

  handleConnection(client: Socket) {

    console.log(
      `Client connected: ${client.id}`,
    );

  }

  //////////////////////////////////////////////////////
  // Client disconnected
  //////////////////////////////////////////////////////

  handleDisconnect(client: Socket) {

    console.log(
      `Client disconnected: ${client.id}`,
    );

  }

  //////////////////////////////////////////////////////
  // Join table room
  //////////////////////////////////////////////////////

  @SubscribeMessage('joinTable')
  handleJoinTable(
    client: Socket,
    tableId: string,
  ) {

    client.join(`table-${tableId}`);

  }

  //////////////////////////////////////////////////////
  // Join chef room
  //////////////////////////////////////////////////////

  @SubscribeMessage('joinChef')
  handleJoinChef(
    client: Socket,
    chefId: string,
  ) {

    client.join(`chef-${chefId}`);

  }

  //////////////////////////////////////////////////////
  // Emit new order
  //////////////////////////////////////////////////////

  emitNewOrder(order: any) {

    this.server.emit(
      'order.created',
      order,
    );

    this.server.to(
      `table-${order.tableId}`,
    ).emit(
      'order.created',
      order,
    );

  }

  //////////////////////////////////////////////////////
  // Emit order update
  //////////////////////////////////////////////////////

  emitOrderUpdate(order: any) {

    this.server.emit(
      'order.updated',
      order,
    );

    this.server.to(
      `table-${order.tableId}`,
    ).emit(
      'order.updated',
      order,
    );

    if (order.chefId) {

      this.server.to(
        `chef-${order.chefId}`,
      ).emit(
        'order.updated',
        order,
      );

    }

  }

}