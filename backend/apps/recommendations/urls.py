from django.urls import path
from .views import (
    TrackInteractionView,
    PersonalizedRecommendationsView,
    RelatedProductsView,
    TrendingProductsView,
    SimilarProductsView,
)

urlpatterns = [
    path("track/", TrackInteractionView.as_view(), name="track-interaction"),
    path(
        "personalized/", PersonalizedRecommendationsView.as_view(), name="personalized"
    ),
    path(
        "related/<int:product_id>/",
        RelatedProductsView.as_view(),
        name="related-products",
    ),
    path("trending/", TrendingProductsView.as_view(), name="trending"),
    path(
        "similar/<int:product_id>/",
        SimilarProductsView.as_view(),
        name="similar-products",
    ),
]
