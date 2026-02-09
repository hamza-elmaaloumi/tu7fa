from . import views
from django.urls import path

urlpatterns = [
    path('item/', views.get_item),                    # <------ LIST OF ALL ITEMS
    path('item/<int:id>/', views.get_item_by_id),     # <------ ONE ITEM DETAILS
    path('item/post/', views.insert_item),            # <------ ADD NEW ITEM
    path('item/delete/<int:id>/', views.del_item),    # <------ DELETE ITEM
    path('item/put/', views.update_item),             # <------ UPDATE ITEM

    path('maalem/items/<int:maalem_id>/', views.get_items_by_maalem),  # <------ MAALEMS SEE THEIR ITEMS
    path('maalem/items/post/<int:maalem_id>/', views.insert_item_by_maalem),  # <------ MAALEM INSERT ITEM
    path('maalem/items/delete/<int:maalem_id>/', views.del_item_by_maalem),  # <------ MAALEM DELETE ITEM
    path('maalem/items/put/<int:maalem_id>/', views.update_item_by_maalem),  # <------ MAALEM UPDATE ITEM

    path('item/like/<int:client_id>/', views.like_item),               # <------ CLIENT LIKE ITEM
    path('item/dislike/<int:client_id>/', views.dislike_item),         # <------ CLIENT UNLIKE ITEM
    path('item/comment/<int:client_id>/', views.comment_to_item),      # <------ CLIENT COMMENT ITEM

    path('item/like-status/<int:client_id>/<int:item_id>/', views.like_status),  # <------ CHECK IF CLIENT LIKED ITEM


    path('item/likes/<int:item_id>/', views.get_likes_for_item),      # <------ GET LIKES FOR ITEM
    path('item/comments/<int:item_id>/', views.get_comments_for_item),# <------ GET COMMENTS FOR ITEM
]