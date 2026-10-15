from django.test import TestCase
from django.urls import reverse

# Create your tests here.
from .models import User, Category, Product, Review

# MODELS TESTS
class CategoryModelTests(TestCase):
    def test_category_name(self):
        category = Category.objects.create(name="Test Category")
        self.assertEqual(category.name, "Test Category")

class ProductModelTests(TestCase):
 
    def test_product_name_price_description(self):
        product = Product.objects.create(name="Test Product", description="Test Description", price=10.00)
        self.assertEqual(product.name, "Test Product")
        self.assertEqual(product.price, 10.00)
        self.assertEqual(product.description, "Test Description")

    def test_product_can_have_multiple_categories(self):
        category1 = Category.objects.create(name="Laptops")
        category2 = Category.objects.create(name="Electronics")
        product = Product.objects.create(name="testproduct",
                                        description="nothing",
                                        price=10, rating=5,)
        product.categories.add(category1)
        product.categories.add(category2)
        self.assertIn(category1, product.categories.all())
        self.assertIn(category2, product.categories.all())
    
class ReviewModelTests(TestCase):
    def test_review_creation(self):
        user = User.objects.create_user(username="testuser", password="testpassword")
        product = Product.objects.create(name="Test product", description="Test Description"
                                        ,price=10.00)
        review = Review.objects.create(product=product, user=user, rating=4.5, comment="Great product!")
        self.assertEqual(review.product, product)
        self.assertEqual(review.user, user)
        self.assertEqual(review.rating, 4.5)
        self.assertEqual(review.comment, "Great product!")

# VIEWS TESTS

class TestIndexView(TestCase):
    def test_index_view(self):
        response = self.client.get(reverse('index'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'onlineStore/index.html')

class TestLoginView(TestCase):
    def test_login_view_get(self):
        response = self.client.get(reverse('login'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'onlineStore/login.html')
        
    def test_login_view_post_valid_credentials(self):
        user = User.objects.create_user(username="testuser", password="testpassword")
        response = self.client.post(reverse('login')
                                    , {'username': user.username, 'password': user.password})
        self.assertRedirects(response, reverse('index'))
        
    
class TestSearchView(TestCase):
    ...
    