from django.db import models
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey

class Notification(models.Model):
    notification_id = models.AutoField(primary_key=True)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    recipient_content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    recipient_object_id = models.PositiveIntegerField()
    recipient = GenericForeignKey('recipient_content_type', 'recipient_object_id')

    def __str__(self):
        return f"Notification to {self.recipient} - {self.message[:20]}..."

    class Meta:
        ordering = ['-created_at']

