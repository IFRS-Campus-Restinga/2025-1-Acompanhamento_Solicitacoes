from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import *
from .models.forms.form_desistencia_vaga import FormDesistenciaVaga
from .models.forms.form_exercicio_domiciliar import FormExercicioDomiciliar

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
admin.site.register(FormTrancDisciplina)
admin.site.register(FormDesistenciaVaga)
admin.site.register(FormExercicioDomiciliar)
admin.site.register(Nome)
admin.site.register(Solicitacao)

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

class SolicitacaoAdmin(admin.ModelAdmin):
    raw_id_fields = ('aluno', )
    list_display = ('id', 'aluno', 'get_formulario_associado', 'data_solicitacao', 'status')

    def get_formulario_associado(self, obj):
        return str(obj.formulario_associado)
    get_formulario_associado.short_description = 'Formulário Associado'
