# Generated by Django 5.1.2 on 2025-03-29 16:21

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Curso',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nome', models.CharField(max_length=255)),
                ('codigo', models.CharField(max_length=50, unique=True)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Ppc',
            fields=[
                ('codigo', models.CharField(max_length=30, primary_key=True, serialize=False, unique=True)),
                ('curso', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ppcs', to='solicitacoes_app.curso')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
