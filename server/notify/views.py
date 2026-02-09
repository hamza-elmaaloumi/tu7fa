from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from .models import Notification
from users.models import MaalemProfile, ClientProfile
from .serializers import NotificationSerializer
from django.contrib.contenttypes.models import ContentType


MODEL_MAP = {
    "maalem": MaalemProfile,
    "client": ClientProfile
}


@api_view(['GET'])
def notification_list(request):
    notifications = Notification.objects.all()
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def notification_create(request): # even triggering this endpoint : adming approving offer; the notification is built for maalem and client
    recipient_type = request.data.get("recipient_type")
    recipient_id = request.data.get("recipient_id")
    message = request.data.get("message")
    is_read = request.data.get("is_read", False)

    Model = MODEL_MAP.get(recipient_type.lower())
    if not Model:
        return Response({'error': 'Invalid recipient_type'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        if Model == MaalemProfile:
            recipient = Model.objects.get(id_maalem=recipient_id)
        else:
            recipient = Model.objects.get(client_id=recipient_id)
    except Model.DoesNotExist:
        return Response({'error': 'Recipient not found'}, status=status.HTTP_404_NOT_FOUND)

    notification_data = {
        "message": message,
        "is_read": is_read,
        "recipient_content_type": ContentType.objects.get_for_model(Model).id,
        "recipient_object_id": recipient_id
    }
    serializer = NotificationSerializer(data=notification_data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def notification_detail(request, notification_id):
    try:
        notification = Notification.objects.get(notification_id=notification_id)
    except Notification.DoesNotExist:
        return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)
    serializer = NotificationSerializer(notification)
    return Response(serializer.data)


@api_view(['PUT', 'PATCH', 'DELETE'])
def notification_update_delete(request, notification_id):
    try:
        notification = Notification.objects.get(notification_id=notification_id)
    except Notification.DoesNotExist:
        return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)
    if request.method in ['PUT', 'PATCH']:
        serializer = NotificationSerializer(notification, data=request.data, partial=(request.method=='PATCH'))
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        notification.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)









#______________________________________________________________________________#
#--------------------------RETRIEVING NOTIFICATIONS----------------------------#
@api_view(['GET'])
def client_notifications(request, client_id):
    client_content_type = ContentType.objects.get(model='clientprofile')
    notifications = Notification.objects.filter(
        recipient_content_type=client_content_type,
        recipient_object_id=client_id
    )
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def maalem_notifications(request, maalem_id):
    maalem_content_type = ContentType.objects.get(model='maalemprofile')
    notifications = Notification.objects.filter(
        recipient_content_type=maalem_content_type,
        recipient_object_id=maalem_id
    )
    serializer = NotificationSerializer(notifications, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def client_unread_notifications_count(request, client_id):
    client_content_type = ContentType.objects.get(model='clientprofile')
    count = Notification.objects.filter(
        recipient_content_type=client_content_type,
        recipient_object_id=client_id,
        is_read=False
    ).count()
    return Response({'unread_count': count})

@api_view(['GET'])
def maalem_unread_notifications_count(request, maalem_id):
    maalem_content_type = ContentType.objects.get(model='maalemprofile')
    count = Notification.objects.filter(
        recipient_content_type=maalem_content_type,
        recipient_object_id=maalem_id,
        is_read=False
    ).count()
    return Response({'unread_count': count})