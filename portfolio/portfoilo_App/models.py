from django.db import models


class Profile(models.Model):
    profile_id = models.AutoField(primary_key=True)
    profile_img = models.ImageField(upload_to='profile/', null=True, blank=True)
    description = models.CharField()

class Skills(models.Model):
    skills_id = models.AutoField(primary_key=True)
    skill_name = models.CharField()
    skill_icon = models.ImageField(upload_to='skills/', null=True, blank=True)

class Works(models.Model):
    works_id = models.AutoField(primary_key=True)
    design_name = models.CharField()
    type_of_work = models.CharField()
    link = models.CharField()
    design_img = models.ImageField(upload_to='works/', null=True, blank=True)

class Contact(models.Model):
    Contact_id = models.AutoField(primary_key=True)
    email = models.EmailField()
    phone = models.IntegerField()

class Social_media(models.Model):
    media_id = models.AutoField(primary_key=True)
    Instagram = models.CharField()
    Telegram = models.CharField()
    Tiktok = models.CharField()
    Whatsapp = models.CharField()

class Message(models.Model):
    message_id = models.AutoField(primary_key=True)
    name = models.CharField()
    email = models.EmailField()
    message = models.CharField()
    sent_date = models.DateTimeField(auto_now_add=True)



