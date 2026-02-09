from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from .models import Item, Like, Comment
from .serializers import ItemSerializer



@api_view(['GET'])
def get_item(request):
    items = Item.objects.all()
    if not items:
        return Response({'error':'no data'}, status=status.HTTP_404_NOT_FOUND)
    serialized = ItemSerializer(items, many=True)
    return Response(serialized.data)

@api_view(['POST'])
def insert_item(request):
    serializer = ItemSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    print(serializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
 
@api_view(['DELETE'])
def del_item(request, id):
    try:
        aimed = Item.objects.get(item_id=id)
    except Item.DoesNotExist:
        return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)
    aimed.delete()
    return Response({'message': 'Item deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

@api_view(['PUT'])
def update_item(request):   
    try:
        item_obj = Item.objects.get(item_id=request.data.get("item_id"))
    except Item.DoesNotExist:
        return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)
    serializer = ItemSerializer(item_obj, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_item_by_id(request, id):
    try:
        item = Item.objects.get(item_id=id)
    except Item.DoesNotExist:
        return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)
    serialized = ItemSerializer(item)
    return Response(serialized.data)









@api_view(['GET'])   # <------- maalem sees his own items
def get_items_by_maalem(request, maalem_id):  
    items = Item.objects.filter(maalem_id=maalem_id)
    if not items:
        return Response({'error': 'No items found for this Maalem'}, status=status.HTTP_404_NOT_FOUND)
    serialized = ItemSerializer(items, many=True)
    return Response(serialized.data)


@api_view(['POST'])     # <----- maalem insert an item of his own
def insert_item_by_maalem(request, maalem_id):
    data = request.data.copy()
    data['maalem'] = maalem_id
    serializer = ItemSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def del_item_by_maalem(request, maalem_id):
    try:
        aimed = Item.objects.get(item_id=request.data.get("item_id"), maalem_id=maalem_id)
    except Item.DoesNotExist:
        return Response({'error': 'Item not found for this Maalem'}, status=status.HTTP_404_NOT_FOUND)
    aimed.delete()
    return Response({'message': 'Item deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

@api_view(['PUT'])      # <----- send maalem_id in URL
def update_item_by_maalem(request, maalem_id):   
    try:
        item_obj = Item.objects.get(item_id=request.data.get("item_id"), maalem_id=maalem_id)
    except Item.DoesNotExist:
        return Response({'error': 'Item not found for this Maalem'}, status=status.HTTP_404_NOT_FOUND)
    serializer = ItemSerializer(item_obj, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)









@api_view(['POST'])
def like_item(request, client_id):
    try:
        item = Item.objects.get(item_id=request.data.get("item_id"))
    except Item.DoesNotExist:
        return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)
    like, created = Like.objects.get_or_create(
        client_id=client_id,
        item=item
    )
    like_count = Like.objects.filter(item=item).count()
    if not created:
        return Response({'message': 'Item already liked', 'like_count': like_count}, status=status.HTTP_200_OK) 
    return Response({'message': 'Item liked successfully', 'like_count': like_count}, status=status.HTTP_201_CREATED)
    
@api_view(['POST'])
def dislike_item(request, client_id):
    try:
        item = Item.objects.get(item_id=request.data.get("item_id"))
    except Item.DoesNotExist:
        return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)
    try:
        like = Like.objects.get(client_id=client_id, item=item)
        like.delete()
        like_count = Like.objects.filter(item=item).count()
        return Response({'message': 'Item disliked successfully', 'like_count': like_count}, status=status.HTTP_200_OK)
    except Like.DoesNotExist:
        like_count = Like.objects.filter(item=item).count()
        return Response({'error': 'Like not found', 'like_count': like_count}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def comment_to_item(request, client_id):
    try:
        try:
            item = Item.objects.get(item_id=request.data.get("item_id"))
        except Item.DoesNotExist:
            return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)
        comment_text = request.data.get("text", "").strip()
        if not comment_text:
            return Response({'error': 'Comment text is required'}, status=status.HTTP_400_BAD_REQUEST)
        comment = Comment.objects.create(
            client_id=client_id,
            item=item,
            text=comment_text
        )
    except Exception as e:
        print(f'🔴🔴 the error: {e}')
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    return Response({'message': 'Comment added successfully'}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def like_status(request, client_id, item_id):
    try:
        item = Item.objects.get(item_id=item_id)
    except Item.DoesNotExist:
        return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)
    try:
        like = Like.objects.get(client_id=client_id, item=item)
        return Response({'has_liked': True}, status=status.HTTP_200_OK)
    except Like.DoesNotExist:
        return Response({'has_liked': False}, status=status.HTTP_200_OK)









@api_view(['GET'])
def get_likes_for_item(request, item_id):
    try:
        item = Item.objects.get(item_id=item_id)
    except Item.DoesNotExist:
        return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)
    likes = Like.objects.filter(item=item)
    like_count = likes.count()
    return Response({'item_id': item_id, 'like_count': like_count})


@api_view(['GET'])
def get_comments_for_item(request, item_id):
    try:
        item = Item.objects.get(item_id=item_id)
    except Item.DoesNotExist:
        return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)
    comments = Comment.objects.filter(item=item)
    serialized_comments = [{'client_id': comment.client_id, 'text': comment.text, 'created_at': comment.created_at} for comment in comments]
    return Response({'item_id': item_id, 'comments': serialized_comments})