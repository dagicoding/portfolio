from django.urls import path 
from . import views

urlpatterns = [
    path('', views.home_view, name = 'home'),
    path('manage/', views.login_view, name = 'login'),
    path('manage/dashboard', views.admin_view, name = 'admin'),
    path('manage/profile', views.profile_view, name = 'profile'),
    path('updateProfile/<int:profile_id>/ ', views.update_profile , name = 'updateProfile'),
    path('manage/skills/', views.add_skills, name = 'add_skills'),
    path('manage-skills/', views.manage_skills, name = 'manage_skills'),
    path('deleteskill/<int:skills_id>/', views.delete_skill, name = 'delete_skill'),
    path('updateSkill/<int:skills_id>/' , views.update_skill, name = 'updateSkill'),
    path('manage/addWork/', views.addWork_view , name = 'addWork'),
    path('manage/manageWorks/', views.manageWorks, name = 'manageWorks'),
    path('delete-work/<int:works_id>/', views.deleteWork, name = 'deleteWork'),
    path('updateWork/<int:works_id>/', views.updateWork, name = 'updateWork'),
    path('moreworks/<int:works_id>/', views.morework_view, name = 'morework'),
    path('like/<int:works_id>/', views.like_view, name = 'like'),
    path('manage/contact/', views.contact_view, name = 'manageContact'),
    path('updateContact/<int:Contact_id>/', views.updateContact, name = 'updateContact'),
    path('manage/messages/', views.message_view, name = 'message'),
]