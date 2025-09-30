import apiClient from './api';

class ArticleService {
  // Get published articles
  async getArticles() {
    try {
      const response = await apiClient.get('/articles');
      return { success: true, articles: response.data.articles };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch articles',
      };
    }
  }

  // Get specific article by ID
  async getArticle(articleId) {
    try {
      const response = await apiClient.get(`/articles/${articleId}`);
      return { success: true, article: response.data.article };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch article',
      };
    }
  }

  // Get all articles (Admin/Vet only)
  async getAllArticles() {
    try {
      const response = await apiClient.get('/articles/admin/all');
      return { success: true, articles: response.data.articles };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch all articles',
      };
    }
  }

  // Get my articles (for veterinarians)
  async getMyArticles() {
    try {
      const response = await apiClient.get('/articles/admin/all');
      return { success: true, articles: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch my articles',
      };
    }
  }

  // Create new article (Admin/Vet only)
  async createArticle(articleData) {
    try {
      const response = await apiClient.post('/articles', articleData);
      return { success: true, article: response.data.article };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create article',
      };
    }
  }

  // Update article (Admin/Vet only)
  async updateArticle(articleId, articleData) {
    try {
      const response = await apiClient.put(`/articles/${articleId}`, articleData);
      return { success: true, article: response.data.article };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update article',
      };
    }
  }

  // Publish article (Admin only)
  async publishArticle(articleId) {
    try {
      const response = await apiClient.patch(`/articles/${articleId}/publish`);
      return { success: true, article: response.data.article };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to publish article',
      };
    }
  }

  // Delete article (Admin/Vet only)
  async deleteArticle(articleId) {
    try {
      await apiClient.delete(`/articles/${articleId}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete article',
      };
    }
  }
}

const articleService = new ArticleService();
export default articleService;
