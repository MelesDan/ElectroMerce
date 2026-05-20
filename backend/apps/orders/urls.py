from django.urls import path
from .views import OrderListView, OrderDetailView, CreateOrderView, CancelOrderView

urlpatterns = [
    path("", OrderListView.as_view(), name="orders"),
    path("create/", CreateOrderView.as_view(), name="create-order"),
    path("<int:pk>/", OrderDetailView.as_view(), name="order-detail"),
    path("<int:order_id>/cancel/", CancelOrderView.as_view(), name="cancel-order"),
]
