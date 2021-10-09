package com.example.testlocal.repository;

import com.example.testlocal.domain.entity.Chat;

import com.example.testlocal.domain.entity.Room;
import com.example.testlocal.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Long> {

    @Query(value = "select * from chat where room_id = ?1", nativeQuery = true)
    List<Chat> findAllByRoomId(Long roomId);

}
