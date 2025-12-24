from django.db import models

class Floor(models.Model):
    number = models.IntegerField()
    svg_file = models.FileField(upload_to='svg/')

    def __str__(self):
        return f"Этаж {self.number}"


class Room(models.Model):
    room_id = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=50)
    floor = models.ForeignKey(Floor, on_delete=models.CASCADE)
    svg_element_id = models.CharField(
        max_length=50,
        help_text="ID элемента в SVG"
    )

    def __str__(self):
        return self.name
