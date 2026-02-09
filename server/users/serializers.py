from rest_framework import serializers
from .models import AdminProfile, MaalemProfile, ClientProfile

class MaalemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MaalemProfile
        fields = '__all__'

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClientProfile
        fields = '__all__'

class AdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminProfile
        fields = '__all__'