from django.urls import path
from .views import room_view

urlpatterns = [
    path("room/<str:corp>/<str:number>/", room_view, name="room"),
]
