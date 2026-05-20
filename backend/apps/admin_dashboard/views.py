from django.shortcuts import render

# Create your views here.
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
from apps.orders.models import Order
from apps.products.models import Product, Category
from apps.accounts.models import User


class IsAdminPermission:
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminPermission]

    def get(self, request):
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)

        # Sales statistics
        total_orders = Order.objects.count()
        total_revenue = (
            Order.objects.filter(status="delivered").aggregate(
                total=Sum("total_amount")
            )["total"]
            or 0
        )

        pending_orders = Order.objects.filter(status="pending").count()
        processing_orders = Order.objects.filter(status="processing").count()

        # Weekly sales
        weekly_orders = Order.objects.filter(created_at__date__gte=week_ago).count()
        weekly_revenue = (
            Order.objects.filter(
                created_at__date__gte=week_ago, status="delivered"
            ).aggregate(total=Sum("total_amount"))["total"]
            or 0
        )

        # Monthly sales
        monthly_orders = Order.objects.filter(created_at__date__gte=month_ago).count()
        monthly_revenue = (
            Order.objects.filter(
                created_at__date__gte=month_ago, status="delivered"
            ).aggregate(total=Sum("total_amount"))["total"]
            or 0
        )

        # Product statistics
        total_products = Product.objects.count()
        low_stock = Product.objects.filter(stock_quantity__lt=10).count()
        out_of_stock = Product.objects.filter(stock_quantity=0).count()

        # User statistics
        total_users = User.objects.count()
        new_users_today = User.objects.filter(date_joined__date=today).count()

        # Top selling products
        top_products = (
            Product.objects.filter(orderitem__isnull=False)
            .annotate(total_sold=Sum("orderitem__quantity"))
            .order_by("-total_sold")[:5]
        )

        top_products_data = []
        for product in top_products:
            top_products_data.append(
                {
                    "id": product.id,
                    "name": product.name,
                    "total_sold": product.total_sold or 0,
                    "revenue": product.total_sold * product.price
                    if product.total_sold
                    else 0,
                }
            )

        return Response(
            {
                "overview": {
                    "total_orders": total_orders,
                    "total_revenue": total_revenue,
                    "pending_orders": pending_orders,
                    "processing_orders": processing_orders,
                },
                "weekly": {
                    "orders": weekly_orders,
                    "revenue": weekly_revenue,
                },
                "monthly": {
                    "orders": monthly_orders,
                    "revenue": monthly_revenue,
                },
                "products": {
                    "total": total_products,
                    "low_stock": low_stock,
                    "out_of_stock": out_of_stock,
                },
                "users": {
                    "total": total_users,
                    "new_today": new_users_today,
                },
                "top_products": top_products_data,
            }
        )


class SalesChartView(APIView):
    permission_classes = [IsAuthenticated, IsAdminPermission]

    def get(self, request):
        days = int(request.query_params.get("days", 30))
        start_date = timezone.now().date() - timedelta(days=days)

        sales_data = []
        for i in range(days):
            date = start_date + timedelta(days=i)
            daily_sales = (
                Order.objects.filter(
                    created_at__date=date, status="delivered"
                ).aggregate(total=Sum("total_amount"))["total"]
                or 0
            )

            sales_data.append(
                {
                    "date": date.strftime("%Y-%m-%d"),
                    "sales": float(daily_sales),
                    "orders": Order.objects.filter(created_at__date=date).count(),
                }
            )

        return Response(sales_data)


# Serializers for Administrative Dashboard CRUD
from rest_framework import generics, serializers
from django.utils.text import slugify


class AdminProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Product
        fields = "__all__"
        extra_kwargs = {"slug": {"required": False}}

    def validate(self, attrs):
        if not attrs.get("slug") and attrs.get("name"):
            base_slug = slugify(attrs["name"])
            slug = base_slug
            counter = 1
            while Product.objects.filter(slug=slug).exists():
                if self.instance and self.instance.slug == slug:
                    break
                slug = f"{base_slug}-{counter}"
                counter += 1
            attrs["slug"] = slug
        return attrs


class AdminCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"
        extra_kwargs = {"slug": {"required": False}}

    def validate(self, attrs):
        if not attrs.get("slug") and attrs.get("name"):
            base_slug = slugify(attrs["name"])
            slug = base_slug
            counter = 1
            while Category.objects.filter(slug=slug).exists():
                if self.instance and self.instance.slug == slug:
                    break
                slug = f"{base_slug}-{counter}"
                counter += 1
            attrs["slug"] = slug
        return attrs


class AdminOrderSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Order
        fields = "__all__"


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "phone_number",
            "role",
            "address",
            "profile_picture",
            "is_active",
            "date_joined",
        )
        read_only_fields = ("email", "date_joined")


# Administrative CRUD Views
class AdminProductListCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.all().order_by("-created_at")
    serializer_class = AdminProductSerializer
    permission_classes = [IsAuthenticated, IsAdminPermission]


class AdminProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = AdminProductSerializer
    permission_classes = [IsAuthenticated, IsAdminPermission]


class AdminCategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all().order_by("name")
    serializer_class = AdminCategorySerializer
    permission_classes = [IsAuthenticated, IsAdminPermission]


class AdminCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = AdminCategorySerializer
    permission_classes = [IsAuthenticated, IsAdminPermission]


class AdminOrderListView(generics.ListAPIView):
    queryset = Order.objects.all().order_by("-created_at")
    serializer_class = AdminOrderSerializer
    permission_classes = [IsAuthenticated, IsAdminPermission]


class AdminOrderDetailView(generics.RetrieveUpdateAPIView):
    queryset = Order.objects.all()
    serializer_class = AdminOrderSerializer
    permission_classes = [IsAuthenticated, IsAdminPermission]


class AdminUserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated, IsAdminPermission]


class AdminUserDetailView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated, IsAdminPermission]

