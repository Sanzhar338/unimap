from django.db import models
from rooms.models import Room

class Schedule(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    day = models.CharField(max_length=20)
    time = models.CharField(max_length=20)
    subject = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.room} | {self.day} {self.time}"
