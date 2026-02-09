from django.db import models
# Create your models here.

class MaalemProfile(models.Model):
    id_maalem = models.AutoField(primary_key=True)
    firstname = models.CharField(max_length=100)
    lastname = models.CharField(max_length=100)
    address = models.CharField(max_length=255)
    rating = models.FloatField(default=0.0)
    is_managed_by_admin = models.BooleanField(default=True)
    phoneNumber = models.CharField(
        max_length=20,
        unique=True,
    )

    def __str__(self):
        return f"{self.firstname} {self.lastname}"
    
class AdminProfile(models.Model):
    admin_id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=100, unique=True, blank=True, null=True)
    password = models.CharField(max_length=255, unique=True, blank=True, null=True)


class ClientProfile(models.Model):
    client_id = models.AutoField(primary_key=True)
    firstname = models.CharField(max_length=100)
    lastname = models.CharField(max_length=100)
    date_joined = models.DateTimeField(auto_now_add=True)
    address = models.CharField(max_length=255)
    phoneNumber = models.CharField(
        max_length=20,
        unique=True,
    )

    def __str__(self):
        return f"{self.firstname} {self.lastname}"
    


