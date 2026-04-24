from django import forms 
from .models import Profile, Skills, Works, Contact, Social_media, Message

class ProfileForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = '__all__'
        labels = {
            'profile_img' : 'PROFILE IMAGE',
            'description' : 'DESCRIPTION'
        }
        widgets = {
            'profile_img' : forms.FileInput(
                attrs={'class' : 'form-control'}
            ),
            'description' : forms.Textarea(
                attrs={'placeholder' : 'about you', 'class' : 'form-control'})
        }

class SkillForm(forms.ModelForm):
    class Meta:
        model = Skills
        fields = '__all__'
        lables = {
            'skill_name' : 'Skill Name',
            'skill_icon' : 'skill Icon'
        }
        widgets = {
            'skill_name' : forms.TextInput(
                attrs={'placeholder' : 'skill name', 'class' : 'form-control'}),
            'skill_icon' : forms.FileInput(
                attrs={'class' : 'form-control'}
            )
        }


class WorkForm(forms.ModelForm):
    class Meta:
        model = Works
        fields = '__all__'
        lables = {
            'design_name' : 'DESIGN NAME',
            'type_of_work' : 'TYPE OF WORK',
            'link' : 'LINK',
            'description' : 'DESCRIPTION',
            'design_img' : 'DESIGN IMAGE'
        }
        widgets = {
            'design_name' : forms.TextInput(
                attrs={'placeholder' : 'name of the design ', 'class' : 'form-control'}),
            'type_of_work' : forms.TextInput(
                attrs={'placholder' : 'describe the type of the work','class' : 'form-control'}),
            'link' : forms.TextInput(
                attrs={'placholder' : 'Exploar link', 'class' : 'form-control'}),
            'description' : forms.TextInput(
                attrs={'placeholder' : 'about the work', 'class' : 'form-control'}),
            'design_img' : forms.FileInput(
                attrs={'class' : 'form-control'}
            )
        }

class contactForm(forms.ModelForm):
    class Meta:
        model = Contact
        fields = '__all__'
        lables = {
            'email' : 'EMAIL',
            'phone' : "PHONE NUMBER"
        }
        widgets = {
            'email' : forms.EmailInput(
                attrs={'class' : 'form-control'}
            ),
            'phone' : forms.NumberInput(
                attrs={'class' : 'form-control'}
            )
        }


class MessagesForm(forms.ModelForm):
    class Meta:
        model = Message
        fields = '__all__'
        lables = {
            'name' : 'NAME',
            'email' : 'EMAIL',
            'message' : 'MESSAGE'
        }
        widgets = {
            'name' : forms.TextInput(
                attrs={'placeholder' : 'your name', 'class' : 'form-control'}),
            'email' : forms.EmailInput(
                attrs={'placeholder' : 'example@gmail.com', 'class' : 'form-control'}),
            'message' : forms.Textarea(
               attrs={'placeholder' : 'type here .... ', 'class' : 'form-control'})
        }