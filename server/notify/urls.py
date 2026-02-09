from django.urls import path
from . import views

urlpatterns = [
    path('notifications/', views.notification_list, name='notification-list'),
    path('notifications/create/', views.notification_create, name='notification-create'),
    path('notifications/<int:notification_id>/', views.notification_detail, name='notification-detail'),
    path('notifications/<int:notification_id>/update-delete/', views.notification_update_delete, name='notification-update-delete'),

    path('client-notifications/<int:client_id>/', views.client_notifications, name='client-notification-list'),
    path('maalem-notifications/<int:maalem_id>/', views.maalem_notifications, name='maalem-notification-list'),

    path('unread-notifications/client/<int:client_id>/', views.client_unread_notifications_count, name='unread-notification-list'),
    path('unread-notifications/maalem/<int:maalem_id>/', views.maalem_unread_notifications_count, name='maalem-unread-notification-list'),
]
