import json
from django.db import models

class MultiFileField(models.TextField):
    description = "Armazena múltiplos arquivos como uma lista JSON de caminhos."

    def from_db_value(self, value, expression, connection):
        if value is None:
            return []
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            return []

    def to_python(self, value):
        if isinstance(value, list):
            return value
        if value is None:
            return []
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            return []

    def get_prep_value(self, value):
        return json.dumps(value or [])

    def value_to_string(self, obj):
        value = self.value_from_object(obj)
        return self.get_prep_value(value)
