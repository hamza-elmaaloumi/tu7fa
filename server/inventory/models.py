from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator


class Item(models.Model):
    item_id = models.AutoField(primary_key=True)
    
    # Relationship: A Maalem lists many items (1,n)
    maalem = models.ForeignKey(
        'users.MaalemProfile', 
        on_delete=models.CASCADE, 
        related_name='items'
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=100)
    photoUrl = models.URLField(max_length=500)
    maalemAskPrice = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MinValueValidator(0)]
    )
    minSellPrice = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MinValueValidator(0)]
    )
    platformFeePercentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=5.00,  # Platform margin is 5%
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    stockQuantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.title} - {self.maalem.firstname} {self.maalem.lastname}"




class Like(models.Model):
    client_reaction_id = models.AutoField(primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    client = models.ForeignKey('users.ClientProfile', on_delete=models.CASCADE)
    item = models.ForeignKey('Item', on_delete=models.CASCADE)

    class Meta:
        # This prevents a user from liking the same item multiple times
        constraints = [
            models.UniqueConstraint(fields=['client', 'item'], name='unique_user_item_like')
        ]

    def __str__(self):
        return f"Like by {self.client.firstname} {self.client.lastname} on {self.item.title}"


class Comment(models.Model):
    client_reaction_id = models.AutoField(primary_key=True)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    client = models.ForeignKey('users.ClientProfile', on_delete=models.CASCADE)
    item = models.ForeignKey('Item', on_delete=models.CASCADE)

    # No unique constraint here, allowing multiple comments
    def __str__(self):
        return f"Comment by {self.client.firstname} {self.client.lastname} on {self.item.title}: {self.text[:20]}..."