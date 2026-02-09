from django.contrib import admin
from .models import MaalemProfile, ClientProfile, AdminProfile

# Register your models here.

admin.site.register(MaalemProfile)
admin.site.register(ClientProfile)
admin.site.register(AdminProfile)