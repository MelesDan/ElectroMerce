from django.db import models

from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
# Create your models here.


class User(AbstractUser):
    ROLE_CHOICES = (
        ("customer", "Customer"),
        ("admin", "Administrator"),
    )

    phone_regex = RegexValidator(
        regex=r"^\+?251?[0-9]{9,12}$",
        message="Phone number must be Ethiopian format (+2519XXXXXXXX or 09XXXXXXXX)",
    )
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(
        validators=[phone_regex], max_length=13, unique=True, blank=True, null=True
    )
    role = models.CharField(max_length=15, choices=ROLE_CHOICES, default="customer")
    address = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to="profiles/", null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email

    @property
    def is_admin(self):
        return self.role == "admin" or self.is_superuser

    class Meta:
        db_table = "users"
        ordering = ["-date_joined"]
