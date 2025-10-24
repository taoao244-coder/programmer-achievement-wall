import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  useToast,
  Image,
  Text,
  CloseButton,
  Flex,
  Icon,
  InputGroup,
  InputLeftElement
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { FaImage, FaFont, FaFileAlt } from 'react-icons/fa';
import api from '../config/api';

const AddAchievement = ({ onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: '图片过大',
          description: '请上传小于5MB的图片',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top'
        });
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: '标题不能为空',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top'
      });
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      await api.post('/api/achievements', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast({
        title: '🎉 成就添加成功',
        description: '你的里程碑已被记录',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top'
      });

      setTitle('');
      setDescription('');
      setImageFile(null);
      setImagePreview('');
      
      if (onSuccess) onSuccess();
    } catch (error) {
      toast({
        title: '添加失败',
        description: error.response?.data?.error || '请稍后重试',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      bg="white"
      p={8}
      borderRadius="xl"
      boxShadow="lg"
      maxW="600px"
      mx="auto"
      border="1px solid"
      borderColor="blue.100"
    >
      <VStack spacing={6} align="stretch">
        <FormControl isRequired>
          <FormLabel 
            color="gray.700" 
            fontWeight="600"
            fontSize="sm"
            mb={3}
            display="flex"
            alignItems="center"
            gap={2}
          >
            <Icon as={FaFont} color="blue.400" />
            成就标题
          </FormLabel>
          <InputGroup>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入你的里程碑成就"
              focusBorderColor="blue.400"
              borderColor="gray.300"
              _hover={{ borderColor: 'blue.300' }}
              _focus={{ 
                borderColor: 'blue.400',
                boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)'
              }}
              size="lg"
              borderRadius="lg"
              fontSize="md"
            />
          </InputGroup>
        </FormControl>

        <FormControl>
          <FormLabel 
            color="gray.700" 
            fontWeight="600"
            fontSize="sm"
            mb={3}
            display="flex"
            alignItems="center"
            gap={2}
          >
            <Icon as={FaFileAlt} color="blue.400" />
            成就描述
          </FormLabel>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="分享你的故事和经历..."
            rows={5}
            focusBorderColor="blue.400"
            borderColor="gray.300"
            _hover={{ borderColor: 'blue.300' }}
            _focus={{ 
              borderColor: 'blue.400',
              boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)'
            }}
            borderRadius="lg"
            fontSize="md"
            resize="none"
          />
        </FormControl>

        <FormControl>
          <FormLabel 
            color="gray.700" 
            fontWeight="600"
            fontSize="sm"
            mb={3}
            display="flex"
            alignItems="center"
            gap={2}
          >
            <Icon as={FaImage} color="blue.400" />
            上传图片
          </FormLabel>
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            display="none"
            id="image-upload"
          />
          <label htmlFor="image-upload">
            <Button
              as="span"
              leftIcon={<AddIcon />}
              colorScheme="blue"
              variant="outline"
              cursor="pointer"
              w="full"
              size="lg"
              borderRadius="lg"
              _hover={{ 
                bg: 'blue.50',
                transform: 'translateY(-2px)',
                boxShadow: 'md'
              }}
              transition="all 0.2s"
              borderWidth="2px"
              borderStyle="dashed"
            >
              选择图片
            </Button>
          </label>
          <Text fontSize="xs" color="gray.500" mt={2} textAlign="center">
            支持 JPG、PNG 格式，最大 5MB
          </Text>
        </FormControl>

        {imagePreview && (
          <Box 
            position="relative" 
            mt={2}
            borderRadius="lg"
            overflow="hidden"
            boxShadow="md"
            border="2px solid"
            borderColor="blue.100"
          >
            <Image
              src={imagePreview}
              alt="预览"
              maxH="250px"
              w="full"
              objectFit="cover"
            />
            <CloseButton
              position="absolute"
              top={2}
              right={2}
              bg="white"
              borderRadius="full"
              boxShadow="md"
              _hover={{ bg: 'red.50', color: 'red.500' }}
              onClick={handleRemoveImage}
              size="md"
            />
          </Box>
        )}

        <Button
          type="submit"
          colorScheme="blue"
          size="lg"
          isLoading={isSubmitting}
          loadingText="发布中"
          w="full"
          mt={4}
          borderRadius="lg"
          fontWeight="600"
          fontSize="md"
          h="54px"
          _hover={{ 
            transform: 'translateY(-2px)',
            boxShadow: 'lg'
          }}
          _active={{
            transform: 'translateY(0)',
            boxShadow: 'md'
          }}
          transition="all 0.2s"
          bg="blue.400"
        >
          🚀 发布成就
        </Button>
      </VStack>
    </Box>
  );
};

export default AddAchievement;