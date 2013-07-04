from django.conf.urls.defaults import *
from django.contrib import admin
admin.autodiscover()


urlpatterns = patterns('web.views',
    url(r'^$', 'main', name='main_view'),
    url(r'^auth/$', 'auth', name='auth'),
    url(r'^view/$', 'view', name='view'),
    url(r'^update/$', 'update', name='update'),
    url(r'^admin/', include(admin.site.urls)),
)

