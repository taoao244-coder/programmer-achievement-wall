import React, { useState, useEffect } from 'react';
import {
  Box,
  Image,
  Text,
  Heading,
  Button,
  VStack,
  HStack,
  Textarea,
  useToast,
  Divider,
  Icon,
  Flex,
  Badge,
  ScaleFade
} from '@chakra-ui/react';
import { FaHeart, FaComment, FaClock } from 'react-icons/fa';
import api from '../config/api';

const AchievementCard = ({ achievement, onUpdate }) => {
  const [likes, setLikes] = useState(achievement.likes || 0);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments]);

  const fetchComments = async () => {
    try {
      const response = await api.get(`/api/achievements/${achievement.id}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error('获取评论失败:', error);
    }
  };

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);

    try {
      const response = await api.post(`/api/achievements/${achievement.id}/like`);
      setLikes(response.data.likes);
      setIsLiked(true);
      toast({
        title: '❤️ 点赞成功',
        status: 'success',
        duration: 1500,
        isClosable: true,
        position: 'top'
      });
    } catch (error) {
      toast({
        title: '点赞失败',
        description: error.response?.data?.error || '请稍后重试',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top'
      });
    } finally {
      setIsLiking(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast({
        title: '评论内容不能为空',
        status: 'warning',
        duration: 2000,
        isClosable: true,
        position: 'top'
      });
      return;
    }

    setIsCommenting(true);

    try {
      await api.post(`/api/achievements/${achievement.id}/comment`, {
        content: newComment
      });

      setNewComment('');
      fetchComments();
      toast({
        title: '💬 评论成功',
        status: 'success',
        duration: 1500,
        isClosable: true,
        position: 'top'
      });
    } catch (error) {
      toast({
        title: '评论失败',
        description: error.response?.data?.error || '请稍后重试',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top'
      });
    } finally {
      setIsCommenting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', { 
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box
      bg="white"
      borderRadius="2xl"
      boxShadow="0 4px 6px rgba(0, 0, 0, 0.05)"
      overflow="hidden"
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      _hover={{ 
        transform: 'translateY(-8px)', 
        boxShadow: '0 20px 40px rgba(49, 130, 206, 0.15)',
        borderColor: 'blue.100'
      }}
      border="1px solid"
      borderColor="gray.100"
      position="relative"
    >
      {achievement.image_url && (
        <Box position="relative" overflow="hidden">
          <Image
            src={achievement.image_url}
            alt={achievement.title}
            w="100%"
            h="220px"
            objectFit="cover"
            transition="transform 0.3s"
            _hover={{ transform: 'scale(1.05)' }}
          />
          <Box
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            h="40px"
            bgGradient="linear(to-t, rgba(0,0,0,0.4), transparent)"
          />
        </Box>
      )}

      <VStack align="stretch" p={6} spacing={4}>
        <Heading 
          size="md" 
          color="gray.800" 
          noOfLines={2}
          fontWeight="700"
          lineHeight="1.4"
        >
          {achievement.title}
        </Heading>

        <Text 
          color="gray.600" 
          fontSize="sm" 
          noOfLines={3}
          lineHeight="1.6"
        >
          {achievement.description}
        </Text>

        <HStack spacing={2} color="gray.400" fontSize="xs">
          <Icon as={FaClock} />
          <Text>{formatDate(achievement.created_at)}</Text>
        </HStack>

        <Divider borderColor="gray.200" />

        <Flex justify="space-between" align="center">
          <HStack spacing={3}>
            <Button
              leftIcon={<Icon as={FaHeart} />}
              colorScheme="blue"
              variant={isLiked ? 'solid' : 'ghost'}
              size="sm"
              onClick={handleLike}
              isLoading={isLiking}
              borderRadius="full"
              px={4}
              fontWeight="600"
              _hover={{ 
                bg: isLiked ? 'blue.500' : 'blue.50',
                transform: 'scale(1.05)'
              }}
              transition="all 0.2s"
            >
              {likes}
            </Button>

            <Button
              leftIcon={<Icon as={FaComment} />}
              colorScheme="blue"
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              borderRadius="full"
              px={4}
              fontWeight="600"
              _hover={{ 
                bg: 'blue.50',
                transform: 'scale(1.05)'
              }}
              transition="all 0.2s"
            >
              {comments.length}
            </Button>
          </HStack>

          {comments.length > 0 && !showComments && (
            <Badge 
              colorScheme="blue" 
              borderRadius="full"
              px={3}
              py={1}
              fontSize="xs"
            >
              {comments.length} 条评论
            </Badge>
          )}
        </Flex>

        {showComments && (
          <ScaleFade in={showComments} initialScale={0.95}>
            <VStack align="stretch" spacing={4} mt={2}>
              <Divider borderColor="blue.100" />

              <VStack 
                align="stretch" 
                spacing={3} 
                maxH="250px" 
                overflowY="auto"
                css={{
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: '#F7FAFC',
                    borderRadius: '10px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#BEE3F8',
                    borderRadius: '10px',
                  },
                  '&::-webkit-scrollbar-thumb:hover': {
                    background: '#90CDF4',
                  },
                }}
              >
                {comments.length === 0 ? (
                  <Flex 
                    direction="column" 
                    align="center" 
                    py={6}
                    color="gray.400"
                  >
                    <Icon as={FaComment} boxSize={8} mb={2} />
                    <Text fontSize="sm">暂无评论，快来抢沙发吧~</Text>
                  </Flex>
                ) : (
                  comments.map((comment) => (
                    <Box 
                      key={comment.id} 
                      p={4} 
                      bg="blue.50" 
                      borderRadius="xl"
                      borderLeft="3px solid"
                      borderLeftColor="blue.300"
                      transition="all 0.2s"
                      _hover={{ 
                        bg: 'blue.100',
                        transform: 'translateX(4px)'
                      }}
                    >
                      <Text fontSize="sm" color="gray.700" lineHeight="1.6">
                        {comment.content}
                      </Text>
                      <HStack spacing={2} mt={2}>
                        <Icon as={FaClock} boxSize={3} color="gray.400" />
                        <Text fontSize="xs" color="gray.500">
                          {formatDate(comment.created_at)}
                        </Text>
                      </HStack>
                    </Box>
                  ))
                )}
              </VStack>

              <VStack spacing={3}>
                <Textarea
                  placeholder="分享你的想法..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  size="sm"
                  focusBorderColor="blue.400"
                  borderColor="gray.300"
                  _hover={{ borderColor: 'blue.300' }}
                  borderRadius="lg"
                  rows={3}
                  resize="none"
                  fontSize="sm"
                />

                <Button
                  colorScheme="blue"
                  size="sm"
                  w="full"
                  onClick={handleAddComment}
                  isLoading={isCommenting}
                  loadingText="提交中"
                  borderRadius="lg"
                  fontWeight="600"
                  h="40px"
                  _hover={{ 
                    transform: 'translateY(-2px)',
                    boxShadow: 'md'
                  }}
                  transition="all 0.2s"
                >
                  💬 发表评论
                </Button>
              </VStack>
            </VStack>
          </ScaleFade>
        )}
      </VStack>
    </Box>
  );
};

export default AchievementCard;