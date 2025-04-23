from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Curso, Ppc, CRE, Coordenador, Aluno, Responsavel, Disciplina, Usuario, Turma, FormularioTrancamentoMatricula, FormDispensaEdFisica, FormAbonoFalta, Anexo

# Registro padrão dos outros modelos
admin.site.register(Curso)
admin.site.register(Ppc)
admin.site.register(CRE)
admin.site.register(Coordenador)
admin.site.register(Aluno)
admin.site.register(Responsavel)
admin.site.register(Disciplina)
admin.site.register(Turma)
admin.site.register(FormularioTrancamentoMatricula)
admin.site.register(FormDispensaEdFisica)
admin.site.register(Anexo)
admin.site.register(FormAbonoFalta)

# Customização do admin para o modelo Usuario
@admin.register(Usuario)
class UsuarioAdmin(BaseUserAdmin):
    model = Usuario
    list_display = ('email', 'nome', 'is_active', 'is_staff')
    list_filter = ('is_active', 'is_staff')
    ordering = ('email',)
    search_fields = ('email', 'nome', 'cpf')

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Informações pessoais', {'fields': ('nome', 'cpf', 'telefone', 'data_nascimento')}),
        ('Permissões', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Datas importantes', {'fields': ('last_login',)}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'nome', 'cpf', 'telefone', 'data_nascimento', 'password1', 'password2', 'is_active', 'is_staff', 'is_superuser')}
        ),
    )