from . import views
from django.urls import path

urlpatterns = [
	# Offer endpoints
	path('offers/', views.offer_list, name='offer-list'),
	path('offers/create/', views.offer_create, name='offer-create'),
	path('offers/<int:offer_id>/', views.offer_detail, name='offer-detail'),
    path('offers/client/<int:client_id>/', views.offer_by_client, name='offer-by-client'),

	# Order endpoints
	path('orders/', views.order_list, name='order-list'),
	path('orders/create/', views.order_create, name='order-create'),
	path('orders/<int:order_id>/', views.order_detail, name='order-detail'),

    path('offers/make-offer/', views.make_offer, name='make-offer'),
    path('orders/create-order/', views.convert_offer_to_order, name='create-order'),
]