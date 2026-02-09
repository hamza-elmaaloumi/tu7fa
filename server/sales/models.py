from django.db import models

class Offer(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]

    offer_id = models.AutoField(primary_key=True)
    offer_quantity = models.PositiveIntegerField()
    # offeredPrice is the maalem net (min_sell_price constraint handled in clean() or frontend)
    maalem_net_offer = models.DecimalField(max_digits=10, decimal_places=2)
    client_offer_total = models.DecimalField(max_digits=10, decimal_places=2)
    platform_margin = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    date = models.DateTimeField(auto_now_add=True)
    
    # Relationships
    client = models.ForeignKey('users.ClientProfile', on_delete=models.CASCADE)
    item = models.ForeignKey('inventory.Item', on_delete=models.CASCADE)

    def __str__(self):
        return f"Offer {self.offer_id} - {self.status}"


class Order(models.Model):
    STATUS_CHOICES = [
        ('pickedUp', 'Picked Up'),
        ('delivered', 'Delivered'),
        ('cash_collected', 'Cash Collected'),
        ('maalem_paid', 'Maalem Paid'),
        ('returned', 'Returned'),
    ]

    order_id = models.AutoField(primary_key=True)
    order_quantity = models.PositiveIntegerField()  
    # Financials
    platform_margin = models.DecimalField(max_digits=10, decimal_places=2)
    maalem_net = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2)
    final_price = models.DecimalField(max_digits=10, decimal_places=2)
    final_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    
    # Logistics
    order_date = models.DateTimeField(auto_now_add=True)
    pickup_address = models.TextField()
    delivery_address = models.TextField()
    pickup_time = models.DateTimeField(null=True, blank=True)
    delivery_time = models.DateTimeField(null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pickedUp')

    # The "Becomes" Relationship
    # OneToOne ensures an offer can only be converted to an order once.
    offer = models.OneToOneField(Offer, on_delete=models.PROTECT, related_name='order')

    def __str__(self):
        return f"Order {self.order_id} (from Offer {self.offer.offer_id})"