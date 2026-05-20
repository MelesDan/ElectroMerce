from django.shortcuts import render

# Create your views here.
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.db import transaction
from .models import Order, OrderItem
from .serializers import (
    OrderListSerializer,
    OrderDetailSerializer,
    OrderCreateSerializer,
)
from apps.cart.models import Cart
from apps.products.models import Product


class OrderListView(generics.ListAPIView):
    serializer_class = OrderListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


class CreateOrderView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = OrderCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        cart = Cart.objects.filter(user=request.user).first()
        if not cart or not cart.items.exists():
            return Response(
                {"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Check stock availability
        for item in cart.items.all():
            if item.product.stock_quantity < item.quantity:
                return Response(
                    {"error": f"Insufficient stock for {item.product.name}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Calculate amounts
        subtotal = cart.subtotal
        shipping_cost = 0  # Free shipping for demo
        tax = subtotal * 0.15  # 15% VAT for Ethiopia
        total = subtotal + shipping_cost + tax

        # Create order
        order = Order.objects.create(
            user=request.user,
            status="pending",
            shipping_name=serializer.validated_data["shipping_name"],
            shipping_address=serializer.validated_data["shipping_address"],
            shipping_city=serializer.validated_data["shipping_city"],
            shipping_phone=serializer.validated_data["shipping_phone"],
            payment_method=serializer.validated_data["payment_method"],
            notes=serializer.validated_data.get("notes", ""),
            subtotal=subtotal,
            shipping_cost=shipping_cost,
            tax=tax,
            total_amount=total,
        )

        # Create order items and update stock
        for cart_item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                product_name=cart_item.product.name,
                product_price=cart_item.product.price,
                quantity=cart_item.quantity,
                subtotal=cart_item.subtotal,
            )
            # Update stock
            cart_item.product.stock_quantity -= cart_item.quantity
            cart_item.product.save()

        # Clear cart
        cart.items.all().delete()

        return Response(
            {
                "order": OrderDetailSerializer(order).data,
                "payment_url": f"/api/payments/initiate/{order.order_number}/",
            },
            status=status.HTTP_201_CREATED,
        )


class CancelOrderView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, order_id):
        order = Order.objects.get(id=order_id, user=request.user)

        if order.status not in ["pending", "processing"]:
            return Response(
                {"error": "Order cannot be cancelled"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Restore stock
        for item in order.items.all():
            if item.product:
                item.product.stock_quantity += item.quantity
                item.product.save()

        order.status = "cancelled"
        order.save()

        return Response({"message": "Order cancelled successfully"})
