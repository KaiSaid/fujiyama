from rest_framework.response import Response
from rest_framework.views import APIView


class ProfileDataView(APIView):
    """Данные личного кабинета текущего пользователя (ученика или администратора)."""

    def get(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)

        attendances = list(
            user.attendances.values('id', 'date', 'is_present', 'training_group__name')
        )

        return Response({
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'belt_level': profile.belt if profile else None,
            'kyu': profile.kyu if profile else None,
            'next_exam_date': profile.next_exam_date if profile else None,
            'attendances': attendances,
        })
