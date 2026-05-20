from django.contrib import admin

# Register your models here.
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    model = User

    list_display = ("id", "email", "username", "role", "is_admin", "is_active")
    list_filter = ("role", "is_active", "is_superuser")
    search_fields = ("email", "username", "phone_number")
    ordering = ("-created_at",)

    fieldsets = (
        (None, {"fields": ("email", "username", "password")}),
        ("Personal Info", {"fields": ("phone_number", "address", "profile_picture")}),
        ("Permissions", {"fields": ("role", "is_active", "is_superuser", "is_staff")}),
        ("Dates", {"fields": ("last_login", "created_at")}),
    )
