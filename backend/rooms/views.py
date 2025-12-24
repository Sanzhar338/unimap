from django.shortcuts import render
from django.http import Http404


def room_view(request, corp, number):
    if not number.isdigit():
        raise Http404("Неверный номер аудитории")

    floor = int(number[0])  # 3** -> 3 этаж

    context = {
        "corp": corp,
        "room": f"{corp}/{number}",
        "floor": floor,
    }

    return render(request, "room.html", context)
