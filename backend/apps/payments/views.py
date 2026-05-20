# Create your views here.
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import redirect
from django.conf import settings
from .models import Payment
from .chapa_client import ChapaClient
from apps.orders.models import Order

chapa_client = ChapaClient()


class InitiatePaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, order_number):
        try:
            order = Order.objects.get(order_number=order_number, user=request.user)
        except Order.DoesNotExist:
            return Response(
                {"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Create transaction reference
        tx_ref = f"TXN-{order.order_number}-{order.id}"

        # Initialize payment
        result = chapa_client.initialize_payment(
            tx_ref=tx_ref,
            amount=order.total_amount,
            email=request.user.email,
            phone_number=request.user.phone_number,
            callback_url=f"{settings.BASE_URL}/api/payments/verify/{tx_ref}",
            return_url=f"{settings.FRONTEND_URL}/order-success/{order.order_number}",
        )

        if result["success"]:
            # Create payment record
            Payment.objects.create(
                order=order,
                transaction_id=tx_ref,
                amount=order.total_amount,
                status="pending",
                payment_method=order.payment_method,
            )

            return Response({"checkout_url": result["checkout_url"], "tx_ref": tx_ref})

        return Response(
            {"error": result.get("error", "Payment initialization failed")},
            status=status.HTTP_400_BAD_REQUEST,
        )


class VerifyPaymentView(APIView):
    permission_classes = []

    def get(self, request, tx_ref):
        result = chapa_client.verify_payment(tx_ref)

        if result["success"]:
            payment_data = result["data"]

            try:
                payment = Payment.objects.get(transaction_id=tx_ref)

                if payment_data.get("status") == "success":
                    payment.status = "success"
                    payment.payment_details = payment_data
                    payment.save()

                    # Update order status
                    order = payment.order
                    order.status = "paid"
                    order.payment_status = "paid"
                    order.transaction_id = payment_data.get("transaction_id", "")
                    order.save()

                    return redirect(
                        f"{settings.FRONTEND_URL}/order-success/{order.order_number}"
                    )
                else:
                    payment.status = "failed"
                    payment.save()

            except Payment.DoesNotExist:
                pass

        return redirect(f"{settings.FRONTEND_URL}/payment-failed")


class PaymentWebhookView(APIView):
    permission_classes = []

    def post(self, request):
        signature = request.headers.get("Chapa-Signature", "")

        if chapa_client.webhook_verify(request.data, signature):
            event = request.data.get("event")
            data = request.data.get("data", {})

            if event == "charge.success":
                tx_ref = data.get("tx_ref")

                try:
                    payment = Payment.objects.get(transaction_id=tx_ref)
                    payment.status = "success"
                    payment.payment_details = data
                    payment.save()

                    order = payment.order
                    order.status = "paid"
                    order.payment_status = "paid"
                    order.save()

                except Payment.DoesNotExist:
                    pass

            return Response({"status": "ok"})

        return Response(
            {"error": "Invalid signature"}, status=status.HTTP_400_BAD_REQUEST
        )
