"""
WSGI config for danzeenldc_api project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/1.9/howto/deployment/wsgi/
"""

import os
import sys
from django.core.wsgi import get_wsgi_application

sys.path = sys.path + ["/home/danze/projects/danzeenldc-api-angular/danzeenldc_api/"]

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "danzeenldc_api.settings")

application = get_wsgi_application()
