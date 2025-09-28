import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ImageUpload from '../../components/ImageUpload'

// Mock API client
const mockApiClient = {
  post: jest.fn()
}

jest.mock('../../services/api', () => mockApiClient)

describe('ImageUpload Component', () => {
  const mockOnImageUploaded = jest.fn()
  const mockOnRemove = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render upload button when no image', () => {
    render(
      <ImageUpload
        onImageUploaded={mockOnImageUploaded}
        onRemove={mockOnRemove}
      />
    )

    expect(screen.getByText('อัปโหลดรูปภาพ')).toBeInTheDocument()
  })

  it('should show image when provided', () => {
    const testImageUrl = 'data:image/jpeg;base64,test-image-data'
    
    render(
      <ImageUpload
        imageUrl={testImageUrl}
        onImageUploaded={mockOnImageUploaded}
        onRemove={mockOnRemove}
      />
    )

    const image = screen.getByRole('img')
    expect(image).toHaveAttribute('src', testImageUrl)
    expect(screen.getByText('เปลี่ยนรูปภาพ')).toBeInTheDocument()
  })

  it('should handle file selection', async () => {
    const user = userEvent.setup()
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    
    mockApiClient.post.mockResolvedValue({
      data: {
        file: {
          url: 'http://example.com/test.jpg'
        }
      }
    })

    render(
      <ImageUpload
        onImageUploaded={mockOnImageUploaded}
        onRemove={mockOnRemove}
      />
    )

    const fileInput = screen.getByLabelText(/อัปโหลดรูปภาพ/i)
    await user.upload(fileInput, file)

    await waitFor(() => {
      expect(mockApiClient.post).toHaveBeenCalledWith('/upload', expect.any(FormData))
    })
  })

  it('should handle upload success', async () => {
    const user = userEvent.setup()
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    
    const mockResponse = {
      data: {
        file: {
          url: 'http://example.com/test.jpg'
        }
      }
    }
    
    mockApiClient.post.mockResolvedValue(mockResponse)

    render(
      <ImageUpload
        onImageUploaded={mockOnImageUploaded}
        onRemove={mockOnRemove}
      />
    )

    const fileInput = screen.getByLabelText(/อัปโหลดรูปภาพ/i)
    await user.upload(fileInput, file)

    await waitFor(() => {
      expect(mockOnImageUploaded).toHaveBeenCalledWith('http://example.com/test.jpg')
    })
  })

  it('should handle upload error', async () => {
    const user = userEvent.setup()
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    
    mockApiClient.post.mockRejectedValue(new Error('Upload failed'))

    render(
      <ImageUpload
        onImageUploaded={mockOnImageUploaded}
        onRemove={mockOnRemove}
      />
    )

    const fileInput = screen.getByLabelText(/อัปโหลดรูปภาพ/i)
    await user.upload(fileInput, file)

    await waitFor(() => {
      expect(screen.getByText(/เกิดข้อผิดพลาดในการอัปโหลด/i)).toBeInTheDocument()
    })
  })

  it('should handle remove image', async () => {
    const user = userEvent.setup()
    const testImageUrl = 'data:image/jpeg;base64,test-image-data'
    
    render(
      <ImageUpload
        imageUrl={testImageUrl}
        onImageUploaded={mockOnImageUploaded}
        onRemove={mockOnRemove}
      />
    )

    const removeButton = screen.getByText('ลบรูปภาพ')
    await user.click(removeButton)

    expect(mockOnRemove).toHaveBeenCalled()
  })

  it('should validate file type', async () => {
    const user = userEvent.setup()
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' })
    
    render(
      <ImageUpload
        onImageUploaded={mockOnImageUploaded}
        onRemove={mockOnRemove}
      />
    )

    const fileInput = screen.getByLabelText(/อัปโหลดรูปภาพ/i)
    await user.upload(fileInput, invalidFile)

    await waitFor(() => {
      expect(screen.getByText(/กรุณาเลือกไฟล์รูปภาพ/i)).toBeInTheDocument()
    })
  })
})
