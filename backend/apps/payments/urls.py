from django.urls import path
from .views import InitiatePaymentView, VerifyPaymentView, PaymentWebhookView

urlpatterns = [
    path(
        "initiate/<str:order_number>/",
        InitiatePaymentView.as_view(),
        name="initiate-payment",
    ),
    path("verify/<str:tx_ref>/", VerifyPaymentView.as_view(), name="verify-payment"),
    path("webhook/", PaymentWebhookView.as_view(), name="payment-webhook"),
]
