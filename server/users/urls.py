from . import views
from django.urls import path

urlpatterns = [
    path('maalem/', views.get_maalem),
    path('maalem/<int:id>/', views.get_maalem_by_id),        # <------ LOGIN
    path('maalem/login/<str:phoneNumber>/', views.get_maalem_by_phone),  # <------ LOGIN BY PHONE
    path('maalem/post/', views.insert_maalem),               # <------ SIGNUP
    path('maalem/delete/<int:id>/', views.del_maalem),       # <------ DELETE ACCOUNT
    path('maalem/update/<int:id>/', views.update_maalem),    # <------ UPDATE ACCOUNT INFO

    path('client/', views.get_Client),
    path('client/<int:id>/', views.get_Client_by_id),        # <------ LOGIN
    path('client/login/<str:phoneNumber>/', views.get_client_by_phone),  # <------ LOGIN BY PHONE
    path('client/post/', views.insert_Client),               # <------ SIGNUP
    path('client/delete/<int:id>/', views.del_Client),       # <------ DELETE ACCOUNT
    path('client/update/<int:id>/', views.update_Client),    # <------ UPDATE ACCOUNT INFO

    path('admin/', views.get_admin),
    path('admin-secret-path-login/', views.login_admin),        # <------ LOGIN
]
