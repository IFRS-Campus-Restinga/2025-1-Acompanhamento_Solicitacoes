from django.db import models

class AnexoManager(models.Manager):
    def get_anexos_form_ed_fisica(self, id):
        return self.filter(form_disp_ed_fisica__id=id)
        
