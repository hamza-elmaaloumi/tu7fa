from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from .models import Offer, Order
from .serializers import OfferSerializer, OrderSerializer
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from inventory.models import Item




    
# Offer CRUD
@api_view(['GET'])
def offer_list(request):
    offers = Offer.objects.all()
    serializer = OfferSerializer(offers, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def offer_create(request):
    serializer = OfferSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def offer_detail(request, offer_id):
    try:
        offer = Offer.objects.get(offer_id=offer_id)
    except Offer.DoesNotExist:
        return Response({'error': 'Offer not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = OfferSerializer(offer)
        return Response(serializer.data)
    elif request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        serializer = OfferSerializer(offer, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        offer.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
def offer_by_client(request, client_id):
    offers = Offer.objects.filter(client_id=client_id)
    if not offers:
        return Response({'error': 'No offers found for this client'}, status=status.HTTP_404_NOT_FOUND)
    serializer = OfferSerializer(offers, many=True)
    return Response(serializer.data)




# Order CRUDclear
@api_view(['GET'])
def order_list(request):
    orders = Order.objects.all()
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def order_create(request):
    serializer = OrderSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    print('🔴🔴🔴🔴🔴🔴🔴🔴:', serializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def order_detail(request, order_id):
    try:
        order = Order.objects.get(order_id=order_id)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = OrderSerializer(order)
        return Response(serializer.data)
    elif request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        serializer = OrderSerializer(order, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        order.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)







# request body should send maalemaskprice as maalem_net_offer
# and displayed_choosed_offer as client_offer_total
# platfrom_margin is calculated as client_offer_total - maalem_net_offer in frontend
@api_view(['POST'])
def make_offer(request):
    # quantity check will be handled in frontend
    print(f'the type of pk coming is {type(request.data.get("client"))}')
    serializer = OfferSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    print(serializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# offer_id comes in request body from frontend
@api_view(['POST'])
def convert_offer_to_order(request):
    try:
        offer = Offer.objects.get(offer_id=request.data.get('offer_id'))
    except Offer.DoesNotExist:
        return Response({'error': 'Offer not found'}, status=status.HTTP_404_NOT_FOUND)
    serializer = OrderSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        # Update offer status to accepted
        offer.status = 'accepted'
        offer.save()
        currenItem: Item = offer.item
        currenItem.stockQuantity = currenItem.stockQuantity - offer.offer_quantity
        currenItem.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)