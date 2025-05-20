from django.contrib.auth.models import Permission
from rest_framework.views import APIView
from rest_framework.response import Response

class PermissaoListView(APIView):
    def get(self, request):
        permissions = Permission.objects.select_related('content_type').all()
        data = [{
            'id': perm.id,
            'name': perm.name,
            'codename': perm.codename,
            'content_type': {
                'app_label': perm.content_type.app_label,
                'model': perm.content_type.model
            }
        } for perm in permissions]
        return Response(data)
