from django.shortcuts import render, redirect , get_object_or_404
from django.contrib.auth import login , logout , authenticate
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from .models import Profile, Skills, Works, Contact, Social_media, Message
from. form import ProfileForm , SkillForm , WorkForm , contactForm , MessagesForm

def home_view(request):
    homeprofile = Profile.objects.all()
    homeskills = Skills.objects.all()
    homeworks = Works.objects.all()
    homeContact = Contact.objects.all()

    if request.method == "POST":
        form = MessagesForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('home')
    else:
        form = MessagesForm()
    context = {'homeprofile' : homeprofile , 'homeskills' : homeskills, 'homeworks' : homeworks, 'homeContact' : homeContact, 'form' : form}
    return render(request,'mainpages/home.html',context)

def login_view(request):
    error = None
    if request.method == "POST":
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(User , username = username , password = password)

        if user is not None:
            login(request, user)
            next_url = request.POST.get('next') or request.GET.get('next') or ('admin')
            return redirect(next_url)

        else:
            error = {'error' : 'invalid username or password'}
    return render(request, 'manage/login.html', error)

def admin_view(request):
    skills = Skills.objects.count()
    works = Works.objects.count()
    messages = Message.objects.count()
    return render(request, 'manage/dashboard.html', {'skills' : skills, 'works' : works, 'messages' : messages})


def profile_view(request):
    profile = Profile.objects.all()
    return render(request, 'manage/profile.html', {'profile' : profile})


def update_profile(request, profile_id):
    profile = get_object_or_404(Profile, profile_id = profile_id)
    form = ProfileForm(request.POST, request.FILES)
    if request.method == "POST":
        form = ProfileForm(request.POST, request.FILES, instance=profile)
        if form.is_valid():
            form.save()
            return redirect('profile')
    else:
        form = ProfileForm(instance=profile)
    return render(request, 'update/update_profile.html', {'form' : form, 'profile' : profile})

def add_skills(request):
    if request.method == 'POST':
        form  =  SkillForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('add_skills')
    else:
        form = SkillForm()
    return render(request, 'manage/add_skills.html', {'form' : form})

def manage_skills(request):
    skills = Skills.objects.all()
    return render(request, 'manage/manage_skills.html', {'skills' : skills})

def delete_skill(request , skills_id):
    skill = get_object_or_404(Skills, skills_id = skills_id)
    skill.delete()
    return redirect('manage_skills')

def update_skill(request, skills_id):
    skill = get_object_or_404(Skills, skills_id = skills_id)
    form = SkillForm(request.POST, request.FILES, instance=skill)
    if request.method == "POST":
        if form.is_valid():
            form.save()
            return redirect('manage_skills')
    else:
        form =SkillForm(instance=skill)
    return render(request, 'update/update_skill.html', {'form' : form, 'skill' : skill})

def addWork_view(request):
    if request.method == "POST":
        form = WorkForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('addWork')
    else:
        form = WorkForm()
    return render(request, 'manage/addWork.html', {'form' : form})

def manageWorks(request):
    work = Works.objects.all()
    return render(request, 'manage/manageWorks.html', {'work' : work})

def deleteWork(request, works_id):
    work = get_object_or_404(Works, works_id = works_id)
    work.delete()
    return redirect('manageWorks')

def updateWork(request, works_id):
    work = get_object_or_404(Works, works_id = works_id)
    form = WorkForm(request.POST, request.FILES, instance= work)
    if request.method == "POST":
        if form.is_valid():
            form.save()
            return redirect('manageWorks')
    else:
        form = WorkForm(instance= work)
    return render(request, 'update/updateWork.html', {'form' : form, 'work' : work})

def like_view(request, works_id):
    work = get_object_or_404(Works, works_id = works_id)
    liked_works = request.session.get('liked_works', [])

    if works_id in liked_works:
        liked_works.remove(works_id)
        work.likes = max(0, work.likes -1 )
    else:
        liked_works.append(works_id)
        work.likes +=1

    request.session['liked_works'] = liked_works
    work.save()

    return redirect('morework', works_id=work.works_id)


def morework_view(request, works_id):
    allwork = Works.objects.all()
    work_item = get_object_or_404(Works, works_id = works_id)
    return render(request, 'mainpages/more.html', {'work' : work_item, 'allwork': allwork})

def contact_view(request):
    contact = Contact.objects.all()
    return render(request, 'manage/manageContact.html', {'contact' : contact})

def updateContact(request, Contact_id):
    contact = get_object_or_404(Contact, Contact_id = Contact_id)
    form  = contactForm(request.POST, instance=contact)
    if request.method == "POST":
        if form.is_valid():
            form.save()
            return redirect('manageContact')
    else:
        form = contactForm(instance= contact)
    return render(request, 'update/updateContact.html', {'form' : form, 'contact' : contact})


def message_view(request):
    message = Message.objects.all()
    return render(request, 'manage/manageMessages.html', {'message' : message})

        
    
