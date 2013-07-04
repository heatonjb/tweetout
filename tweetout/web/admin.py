from django.contrib import admin
from web.models import User


class UserAdmin(admin.ModelAdmin):
    model = User
  
admin.site.register(User, UserAdmin)
