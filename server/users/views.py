from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from .models import MaalemProfile, ClientProfile, AdminProfile
from .serializers import MaalemSerializer, ClientSerializer, AdminSerializer

#_____________________________________________#
#-----------------Maalem APIs-----------------#
@api_view(['GET'])
def get_maalem(request):
    maalems = MaalemProfile.objects.all()
    if not maalems:
        return Response({'error':'no data'}, status=status.HTTP_404_NOT_FOUND)
    serialized = MaalemSerializer(maalems, many=True)
    return Response(serialized.data)

@api_view(['POST'])
def insert_maalem(request):
    serializer = MaalemSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)  

@api_view(['DELETE'])
def del_maalem(request, id):
    try:
        aimed = MaalemProfile.objects.get(id_maalem=id)
    except MaalemProfile.DoesNotExist:
        return Response({'error': 'Maalem not found'}, status=status.HTTP_404_NOT_FOUND)
    aimed.delete()
    return Response({'message': 'Maalem deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
def get_maalem_by_id(request, id):
    try:
        maalem = MaalemProfile.objects.get(id_maalem=id)
    except MaalemProfile.DoesNotExist:
        return Response({'error': 'Maalem not found'}, status=status.HTTP_404_NOT_FOUND)
    serialized = MaalemSerializer(maalem)
    return Response(serialized.data)

@api_view(['PUT'])
def update_maalem(request, id):
    try:
        maalem = MaalemProfile.objects.get(id_maalem=id)
    except MaalemProfile.DoesNotExist:
        return Response({'error': 'Maalem not found'}, status=status.HTTP_404_NOT_FOUND)
    serializer = MaalemSerializer(maalem, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_maalem_by_phone(request, phoneNumber):
    try:
        maalem = MaalemProfile.objects.get(phoneNumber=phoneNumber)
    except MaalemProfile.DoesNotExist:
        return Response({'error': 'Maalem with provided phone number doesn`t exist'}, status=status.HTTP_404_NOT_FOUND)
    serialized = MaalemSerializer(maalem)
    return Response(serialized.data)



#_____________________________________________#
#-----------------Client APIs-----------------#
@api_view(['GET'])
def get_Client(request):
    Clients = ClientProfile.objects.all()
    if not Clients:
        return Response({'error':'no data'}, status=status.HTTP_404_NOT_FOUND)
    serialized = ClientSerializer(Clients, many=True)
    return Response(serialized.data)

@api_view(['POST'])
def insert_Client(request):
    serializer = ClientSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    print(serializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)  

@api_view(['DELETE'])
def del_Client(request, id):
    try:
        aimed = ClientProfile.objects.get(client_id=id)
    except ClientProfile.DoesNotExist:
        return Response({'error': 'Client not found'}, status=status.HTTP_404_NOT_FOUND)
    aimed.delete()
    return Response({'message': 'Client deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
def get_Client_by_id(request, id):
    try:
        Client = ClientProfile.objects.get(client_id=id)
    except ClientProfile.DoesNotExist:
        return Response({'error': 'Client not found'}, status=status.HTTP_404_NOT_FOUND)
    serialized = ClientSerializer(Client)
    return Response(serialized.data)


@api_view(['GET'])
def get_client_by_phone(request, phoneNumber):
    try:
        client = ClientProfile.objects.get(phoneNumber=phoneNumber)
    except ClientProfile.DoesNotExist:
        return Response({'error': 'Client with provided phone number doesn`t exist'}, status=status.HTTP_404_NOT_FOUND)
    serialized = ClientSerializer(client)
    return Response(serialized.data)



#_____________________________________________#
#-----------------Admin APIs-----------------#
@api_view(['GET'])
def get_admin(request):
    admins = AdminProfile.objects.all()
    if not admins:
        return Response({'error':'no data'}, status=status.HTTP_404_NOT_FOUND)
    serialized = AdminSerializer(admins, many=True)
    return Response(serialized.data)

@api_view(['POST'])
def insert_admin(request):
    serializer = AdminSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def del_admin(request, id):
    try:
        aimed = AdminProfile.objects.get(admin_id=id)
    except AdminProfile.DoesNotExist:
        return Response({'error': 'Admin not found'}, status=status.HTTP_404_NOT_FOUND)
    aimed.delete()
    return Response({'message': 'Admin deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
def get_admin_by_id(request, id):
    try:
        admin = AdminProfile.objects.get(admin_id=id)
    except AdminProfile.DoesNotExist:
        return Response({'error': 'Admin not found'}, status=status.HTTP_404_NOT_FOUND)
    serialized = AdminSerializer(admin)
    return Response(serialized.data)

@api_view(['PUT'])
def update_admin(request, id):
    try:
        admin = AdminProfile.objects.get(admin_id=id)
    except AdminProfile.DoesNotExist:
        return Response({'error': 'Admin not found'}, status=status.HTTP_404_NOT_FOUND)
    serializer = AdminSerializer(admin, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
def update_Client(request, id):
    try:
        Client = ClientProfile.objects.get(client_id=id)
    except ClientProfile.DoesNotExist:
        return Response({'error': 'Client not found'}, status=status.HTTP_404_NOT_FOUND)
    serializer = ClientSerializer(Client, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    print(serializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)






@api_view(['GET'])
def get_admins(request):
    admins = AdminProfile.objects.all()
    if not admins:
        return Response({'error':'no data'}, status=status.HTTP_404_NOT_FOUND)
    serialized = AdminSerializer(admins, many=True)
    return Response(serialized.data)

@api_view(['POST'])
def login_admin(request):
    username = request.data.get('username')
    password = request.data.get('password')
    admin = AdminProfile.objects.filter(username=username, password=password).first()
    if not admin:
        return Response({'authenticated':'forbidden'}, status=status.HTTP_404_NOT_FOUND)
    serialized = AdminSerializer(admin)
    return Response(serialized.data)